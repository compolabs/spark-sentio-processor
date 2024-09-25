import { SparkMarketProcessorTemplate } from "./types/fuel/SparkMarketProcessor.js";
import { FuelNetwork } from "@sentio/sdk/fuel";
import { SparkRegistryProcessor } from './types/fuel/SparkRegistryProcessor.js';
import { MARKET_REGISTRY_ADDRESS } from './config.js';
import { CancelOrderEventInput, DepositEventInput, OpenOrderEventInput, TradeOrderEventInput, WithdrawEventInput } from './types/fuel/SparkMarket.js';
import { SparkMarketFactory } from "./types/fuel/index.js";

interface UserScoreSnapshot {
    timestamp: string;
    chain_id: number;
    block_number: number;
    user: string;
    market_address: string;
    total_value_locked_score: number;
}

interface UserTradeData {
    user: string;
    total_trading_volume: number;
    last_trade_timestamp: string;
}

interface UserOpenOrderData {
    user: string;
    total_order_value: number;
    last_order_timestamp: string;
}

interface UserBalance {
    user: string;
    liquid_base_balance: number;
    liquid_quote_balance: number;
    locked_base_balance: number;
    locked_quote_balance: number;
}
const userBalanceData: Record<string, UserBalance> = {};

// const userTradeData: Record<string, UserTradeData> = {};
// const userOrderData: Record<string, UserOpenOrderData> = {};


const marketTemplate = new SparkMarketProcessorTemplate()
    .onLogDepositEvent(async (event, ctx) => {
        ctx.eventLogger.emit('DepositEvent', {
            user: event.data.user.Address?.bits,
            amount: event.data.amount,
            asset: event.data.asset.bits,
            locked_base_amount: event.data.balance.locked.base,
            locked_quote_amount: event.data.balance.locked.quote,
        });
    })
    .onLogWithdrawEvent(async (event, ctx) => {
        ctx.eventLogger.emit('WithdrawEvent', {
            user: event.data.user.Address?.bits,
            amount: event.data.amount,
            asset: event.data.asset.bits,
            locked_base_amount: event.data.balance.locked.base,
            locked_quote_amount: event.data.balance.locked.quote,
        });
    })
    .onLogOpenOrderEvent(async (event, ctx: any) => {
        ctx.eventLogger.emit('OpenOrderEvent', {
            order_id: event.data.order_id,
            asset: event.data.asset.bits,
            amount: event.data.amount,
            order_type: event.data.order_type,
            price: event.data.price,
            user: event.data.user.Address?.bits,
            locked_base_amount: event.data.balance.locked.base,
            locked_quote_amount: event.data.balance.locked.quote,
        });
    })
    .onLogCancelOrderEvent(async (event, ctx: any) => {
        ctx.eventLogger.emit('CancelOrderEvent', {
            user: event.data.user.Address?.bits,
            order_id: event.data.order_id,
            locked_base_amount: event.data.balance.locked.base,
            locked_quote_amount: event.data.balance.locked.quote,
        });
    })
    .onLogTradeOrderEvent(async (event, ctx: any) => {
        ctx.eventLogger.emit('TradeOrderEvent', {
            base_sell_order_id: event.data.base_sell_order_id,
            base_buy_order_id: event.data.base_buy_order_id,
            trade_size: event.data.trade_size,
            trade_price: event.data.trade_price,
            seller: event.data.order_seller.Address?.bits,
            buyer: event.data.order_buyer.Address?.bits,
            seller_base_amount: event.data.s_balance.locked.base,
            seller_quote_amount: event.data.s_balance.locked.quote,
            buyer_base_amount: event.data.b_balance.locked.base,
            buyer_quote_amount: event.data.b_balance.locked.quote,
        });
    });

SparkRegistryProcessor.bind({
    address: MARKET_REGISTRY_ADDRESS,
    chainId: FuelNetwork.TEST_NET
})
    .onLogMarketRegisterEvent(async (log, ctx) => {
        const marketAddress = log.data.market.bits;

        ctx.eventLogger.emit("MarketRegistered", {
            marketAddress: marketAddress,
            baseAsset: log.data.base.bits,
            quoteAsset: log.data.quote.bits,
            message: `Market registered at ${marketAddress}`
        });

        marketTemplate.bind({
            address: marketAddress,
            startBlock: BigInt(ctx.block?.height.toString() ?? "0")
        }, ctx
        );
    })
    .onLogMarketUnregisterEvent(async (log, ctx) => {
        const marketAddress = log.data.market.bits;

        ctx.eventLogger.emit("MarketUnregistered", {
            marketAddress: marketAddress,
            baseAsset: log.data.base.bits,
            quoteAsset: log.data.quote.bits,
            message: `Market unregistered at ${marketAddress}`
        });

    });



