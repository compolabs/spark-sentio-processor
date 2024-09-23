import { SparkMarketProcessor } from "./types/fuel/SparkMarketProcessor.js";
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


// const marketTemplate = new SparkMarketProcessor()
//     .onLogDepositEvent(async (event: DepositEventInput, ctx: any) => {
//         ctx.eventLogger.emit('Deposit', {
//         });
//     })
//     .onLogWithdrawEvent(async (event: WithdrawEventInput, ctx:any) => {
//         ctx.eventLogger.emit('Withdraw', {
//         });
//     })
//     .onLogOpenOrderEvent(async (event: OpenOrderEventInput, ctx: any) => {
//         ctx.eventLogger.emit('Open', {
//         });
//     })
//     .onLogCancelOrderEvent(async (event: CancelOrderEventInput, ctx:any) => {
//         ctx.eventLogger.emit('Cancel', {
//         });
//     })
//     .onLogTradeOrderEvent(async (event: TradeOrderEventInput, ctx: any) => {
//         ctx.eventLogger.emit('Trade', {
//         });
//     });

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

        // marketTemplate.bind({
        //     address: marketAddress,
        //     startBlock: ctx.block?.height ?? 0
        // });

        ctx.meter.Counter('market_registered_total').add(1);
    })
    .onLogMarketUnregisterEvent(async (log, ctx) => {
        const marketAddress = log.data.market.bits;

        ctx.eventLogger.emit("MarketUnregistered", {
            marketAddress: marketAddress,
            baseAsset: log.data.base.bits,
            quoteAsset: log.data.quote.bits,
            message: `Market unregistered at ${marketAddress}`
        });

        ctx.meter.Counter('market_unregistered_total').add(1);
    });



