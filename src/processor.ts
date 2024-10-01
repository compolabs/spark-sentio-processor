import { SparkMarketProcessorTemplate } from "./types/fuel/SparkMarketProcessor.js";
import { FuelBlock, FuelNetwork } from "@sentio/sdk/fuel";
import { SparkRegistryProcessor } from './types/fuel/SparkRegistryProcessor.js';
import { MARKET_REGISTRY_ADDRESS } from './config.js';
import { FuelChainId } from "@sentio/chain";
import { BigDecimal, Gauge, LogLevel } from "@sentio/sdk";
import crypto from "crypto";
import marketsConfig from './marketsConfig.json';

export const getHash = (data: string) => {
    return crypto.createHash("sha256").update(data).digest("hex");
};

import { Balance, UserScoreSnapshot } from './schema/store.js';
import { getPriceBySymbol, getPriceByType } from "@sentio/sdk/utils";

const marketTemplate = new SparkMarketProcessorTemplate()

    .onLogDepositEvent(async (deposit, ctx) => {
        const liquidBaseAmount = BigInt(deposit.data.balance.liquid.base.toString());
        const liquidQuoteAmount = BigInt(deposit.data.balance.liquid.quote.toString());
        const lockedBaseAmount = BigInt(deposit.data.balance.locked.base.toString());
        const lockedQuoteAmount = BigInt(deposit.data.balance.locked.quote.toString());

        // ctx.eventLogger.emit('Deposit', {
        //     market: ctx.contractAddress,
        //     block: ctx.block,
        //     user: deposit.data.user.Address?.bits,
        //     amount: deposit.data.amount,
        //     asset: deposit.data.asset.bits,
        //     liquidBaseAmount: liquidBaseAmount,
        //     liquidQuoteAmount: liquidQuoteAmount,
        //     lockedBaseAmount: lockedBaseAmount,
        //     lockedQuoteAmount: lockedQuoteAmount,
        // });

        const balanceId = getHash(`${deposit.data.user.Address?.bits}-${ctx.contractAddress}`);

        let balance = await ctx.store.get(Balance, balanceId);

        if (!balance) {
            balance = new Balance({
                id: balanceId,
                user: deposit.data.user.Address?.bits,
                market: ctx.contractAddress,
                liquidBaseAmount: liquidBaseAmount,
                liquidQuoteAmount: liquidQuoteAmount,
                lockedBaseAmount: lockedBaseAmount,
                lockedQuoteAmount: lockedQuoteAmount
            });
        } else {
            balance.liquidBaseAmount = liquidBaseAmount,
                balance.liquidQuoteAmount = liquidQuoteAmount,
                balance.lockedBaseAmount = lockedBaseAmount,
                balance.lockedQuoteAmount = lockedQuoteAmount
        }

        await ctx.store.upsert(balance);
    })
    .onLogWithdrawEvent(async (withdraw, ctx) => {
        // ctx.eventLogger.emit('Withdraw', {
        //     user: withdraw.data.user.Address?.bits,
        //     amount: withdraw.data.amount,
        //     asset: withdraw.data.asset.bits,
        //     liquid_base_amount: withdraw.data.balance.liquid.base,
        //     liquid_quote_amount: withdraw.data.balance.liquid.quote,
        //     locked_base_amount: withdraw.data.balance.locked.base,
        //     locked_quote_amount: withdraw.data.balance.locked.quote,
        // });

        const liquidBaseAmount = BigInt(withdraw.data.balance.liquid.base.toString());
        const liquidQuoteAmount = BigInt(withdraw.data.balance.liquid.quote.toString());
        const lockedBaseAmount = BigInt(withdraw.data.balance.locked.base.toString());
        const lockedQuoteAmount = BigInt(withdraw.data.balance.locked.quote.toString());

        const balanceId = getHash(`${withdraw.data.user.Address?.bits}-${ctx.contractAddress}`);

        let balance = await ctx.store.get(Balance, balanceId);

        if (!balance) {
            ctx.eventLogger.emit('Balance not found with withdraw event', {
                severity: LogLevel.ERROR,
                user: withdraw.data.user.Address?.bits,
                reason: 'Balance not found for user',
            });
            return
        } else {
            balance.liquidBaseAmount = liquidBaseAmount,
                balance.liquidQuoteAmount = liquidQuoteAmount,
                balance.lockedBaseAmount = lockedBaseAmount,
                balance.lockedQuoteAmount = lockedQuoteAmount
        }

        await ctx.store.upsert(balance);
    })
    .onLogOpenOrderEvent(async (open, ctx: any) => {
        // ctx.eventLogger.emit('OpenOrder', {
        //     order_id: open.data.order_id,
        //     asset: open.data.asset.bits,
        //     amount: BigInt(open.data.amount.toString()),
        //     order_type: open.data.order_type,
        //     // price: BigInt(open.data.price.toString()),
        //     // user: open.data.user.Address?.bits,
        //     liquid_base_amount: open.data.balance.liquid.base,
        //     liquid_quote_amount: open.data.balance.liquid.quote,
        //     locked_base_amount: open.data.balance.locked.base,
        //     locked_quote_amount: open.data.balance.locked.quote,
        // });
        const liquidBaseAmount = BigInt(open.data.balance.liquid.base.toString());
        const liquidQuoteAmount = BigInt(open.data.balance.liquid.quote.toString());
        const lockedBaseAmount = BigInt(open.data.balance.locked.base.toString());
        const lockedQuoteAmount = BigInt(open.data.balance.locked.quote.toString());

        const balanceId = getHash(`${open.data.user.Address?.bits}-${ctx.contractAddress}`);

        let balance = await ctx.store.get(Balance, balanceId);

        if (!balance) {
            ctx.eventLogger.emit('Balance not found with open order event', {
                severity: LogLevel.ERROR,
                user: open.data.user.Address?.bits,
                reason: 'Balance not found for user',
            });
            return
        } else {
            balance.liquidBaseAmount = liquidBaseAmount,
                balance.liquidQuoteAmount = liquidQuoteAmount,
                balance.lockedBaseAmount = lockedBaseAmount,
                balance.lockedQuoteAmount = lockedQuoteAmount
        }

        await ctx.store.upsert(balance);
    })
    .onLogCancelOrderEvent(async (cancel, ctx: any) => {
        const liquidBaseAmount = BigInt(cancel.data.balance.liquid.base.toString());
        const liquidQuoteAmount = BigInt(cancel.data.balance.liquid.quote.toString());
        const lockedBaseAmount = BigInt(cancel.data.balance.locked.base.toString());
        const lockedQuoteAmount = BigInt(cancel.data.balance.locked.quote.toString());

        const balanceId = getHash(`${cancel.data.user.Address?.bits}-${ctx.contractAddress}`);

        let balance = await ctx.store.get(Balance, balanceId);

        if (!balance) {
            ctx.eventLogger.emit('Balance not found with cancel event', {
                severity: LogLevel.ERROR,
                user: cancel.data.user.Address?.bits,
                reason: 'Balance not found for user',
            });
            return
        } else {
            balance.liquidBaseAmount = liquidBaseAmount,
                balance.liquidQuoteAmount = liquidQuoteAmount,
                balance.lockedBaseAmount = lockedBaseAmount,
                balance.lockedQuoteAmount = lockedQuoteAmount
        }

        await ctx.store.upsert(balance);
    })
    .onLogTradeOrderEvent(async (trade, ctx: any) => {
        const seller_liquidBaseAmount = BigInt(trade.data.s_balance.liquid.base.toString());
        const seller_liquidQuoteAmount = BigInt(trade.data.s_balance.liquid.quote.toString());
        const seller_lockedBaseAmount = BigInt(trade.data.s_balance.locked.base.toString());
        const seller_lockedQuoteAmount = BigInt(trade.data.s_balance.locked.quote.toString());

        const buyer_liquidBaseAmount = BigInt(trade.data.b_balance.liquid.base.toString());
        const buyer_liquidQuoteAmount = BigInt(trade.data.b_balance.liquid.quote.toString());
        const buyer_lockedBaseAmount = BigInt(trade.data.b_balance.locked.base.toString());
        const buyer_lockedQuoteAmount = BigInt(trade.data.b_balance.locked.quote.toString());

        const seller_balanceId = getHash(`${trade.data.order_seller.Address?.bits}-${ctx.contractAddress}`);
        const buyer_balanceId = getHash(`${trade.data.order_buyer.Address?.bits}-${ctx.contractAddress}`);

        let seller_balance = await ctx.store.get(Balance, seller_balanceId);
        let buyer_balance = await ctx.store.get(Balance, buyer_balanceId);

        if (!seller_balance) {
            ctx.eventLogger.emit('Balance not found with trade event', {
                severity: LogLevel.ERROR,
                user: trade.data.order_seller.Address?.bits,
                reason: 'Balance not found for seller',
            });
            return
        } else {
            seller_balance.liquidBaseAmount = seller_liquidBaseAmount,
                seller_balance.liquidQuoteAmount = seller_liquidQuoteAmount,
                seller_balance.lockedBaseAmount = seller_lockedBaseAmount,
                seller_balance.lockedQuoteAmount = seller_lockedQuoteAmount
        }

        await ctx.store.upsert(seller_balance);

        if (!buyer_balance) {
            ctx.eventLogger.emit('Balance not found with trade event', {
                severity: LogLevel.ERROR,
                user: trade.data.order_buyer.Address?.bits,
                reason: 'Balance not found for buyer',
            });
            return
        } else {
            buyer_balance.liquidBaseAmount = buyer_liquidBaseAmount,
                buyer_balance.liquidQuoteAmount = buyer_liquidQuoteAmount,
                buyer_balance.lockedBaseAmount = buyer_lockedBaseAmount,
                buyer_balance.lockedQuoteAmount = buyer_lockedQuoteAmount
        }

        await ctx.store.upsert(buyer_balance);
    });


marketTemplate.onTimeInterval(async (block, ctx) => {
    const balances = await ctx.store.list(Balance, []);

    for (const balance of balances) {

        const marketConfig = Object.values(marketsConfig).find(market => market.market === balance.market);

        if (!marketConfig) {
            ctx.eventLogger.emit('MarketConfigNotFound', {
                severity: LogLevel.ERROR,
                message: `Market config not found for market address ${balance.market}`,
                balanceId: balance.id,
                user: balance.user,
            });
            continue
        } else {
            ctx.eventLogger.emit('MarketConfigSelection', {
                severity: LogLevel.INFO,
                message: `Selected market config for balance with market address ${balance.market}`,
                market: marketConfig.market,
                baseToken: marketConfig.baseToken,
                quoteToken: marketConfig.quoteToken,
                baseDecimal: marketConfig.baseDecimal,
                quoteDecimal: marketConfig.quoteDecimal,
                user: balance.user,
                balanceId: balance.id
            });
        }
        // ctx.eventLogger.emit('MarketConfigSelection', {
        //     severity: LogLevel.INFO,
        //     message: `Selected market config for balance with market address ${balance.market}`,
        //     market: marketConfig.market,
        //     baseToken: marketConfig.baseToken,
        //     quoteToken: marketConfig.quoteToken,
        //     baseDecimal: marketConfig.baseDecimal,
        //     quoteDecimal: marketConfig.quoteDecimal,
        //     user: balance.user,
        //     balanceId: balance.id
        // });
        let baseTokenPrice = (await getPriceBySymbol(marketConfig.baseTokenSymbol, new Date(ctx.timestamp)));
        let quoteTokenPrice = (await getPriceBySymbol(marketConfig.quoteTokenSymbol, new Date(ctx.timestamp)));

        if (!baseTokenPrice) {
            baseTokenPrice = marketConfig.defaultBasePrice;
            ctx.eventLogger.emit('BaseTokenPriceError', {
                severity: LogLevel.ERROR,
                message: `Failed to load base token price for ${marketConfig.baseToken}. Using default price: ${marketConfig.defaultBasePrice}`,
                token: marketConfig.baseTokenSymbol,
                defaultPrice: marketConfig.defaultBasePrice.toString(),
            });
        }

        if (!quoteTokenPrice) {
            quoteTokenPrice = marketConfig.defaultQuotePrice;
            ctx.eventLogger.emit('QuoteTokenPriceError', {
                severity: LogLevel.ERROR,
                message: `Failed to load quote token price for ${marketConfig.quoteToken}. Using default price: ${marketConfig.defaultQuotePrice}`,
                token: marketConfig.quoteTokenSymbol,
                defaultPrice: marketConfig.defaultQuotePrice.toString(),
            });
        }

        const baseTVL = balance.liquidBaseAmount + balance.lockedBaseAmount;
        const quoteTVL = balance.liquidQuoteAmount + balance.lockedQuoteAmount;

        const baseTVLBigDecimal = BigDecimal(baseTVL.toString()).div(BigDecimal(10).pow(marketConfig.baseDecimal));
        const quoteTVLBigDecimal = BigDecimal(quoteTVL.toString()).div(BigDecimal(10).pow(marketConfig.quoteDecimal));

        const totalBaseTVL = baseTVLBigDecimal.multipliedBy(baseTokenPrice);
        const totalQuoteTVL = quoteTVLBigDecimal.multipliedBy(quoteTokenPrice);

        const tvl = totalBaseTVL.plus(totalQuoteTVL).toString();

        const snapshotId = getHash(`${balance.user}-${ctx.contractAddress}-${ctx.transaction}`);
        const snapshot = new UserScoreSnapshot({
            id: snapshotId,
            block_date: ctx.timestamp.toString(),
            timestamp: new Date().toISOString(),
            // timestamp_block: ctx.block?.time,
            chain_id: ctx.chainId,
            block_number: block.height.toString(),
            user_address: balance.user,
            pool_address: ctx.contractAddress,
            total_value_locked_score: tvl
        });

        await ctx.store.upsert(snapshot);

        ctx.eventLogger.emit('SnapshotCreation', {
            severity: LogLevel.INFO,
            message: `Creating snapshot at ${new Date().toISOString()}`,
            block_number: ctx.block?.id,
            user_address: balance.user,
        });

    }
}, 60 * 60);



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


