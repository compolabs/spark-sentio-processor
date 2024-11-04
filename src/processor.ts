import { SparkMarketProcessor } from "./types/fuel/SparkMarketProcessor.js";
import { FuelNetwork } from "@sentio/sdk/fuel";
import { BigDecimal, Counter, Gauge, LogLevel } from "@sentio/sdk";
import crypto from "crypto";
import marketsConfig from './marketsConfig.json';
import { Balance, UserScoreSnapshot } from './schema/store.js';
import { getPriceBySymbol } from "@sentio/sdk/utils";
import { MARKETS } from "./markets.js";
// import { GLOBAL_CONFIG } from "@sentio/runtime"

// GLOBAL_CONFIG.execution = {
//     sequential: true,
// }
export const getHash = (data: string) => {
    return crypto.createHash("sha256").update(data).digest("hex");
};

// const totalTVLGauge = Gauge.register("total_tvl", {
//     sparse: true,
//     aggregationConfig: {
//         intervalInMinutes: [60],
//     }
// });
const depositCounter = Counter.register("deposit");
const withdrawCounter = Counter.register("withdraw");
const withdrawToMarketCounter = Counter.register("withdrawToMarket");
const openOrderCounter = Counter.register("openOrder");
const cancelOrderCounter = Counter.register("cancelOrder");
const tradeOrderCounter = Counter.register("tradeOrder");
MARKETS.forEach((market) => {
    SparkMarketProcessor.bind({
        address: market,
        chainId: FuelNetwork.MAIN_NET
    })
        .onLogDepositEvent(async (deposit, ctx) => {
            depositCounter.add(ctx, 1);
            const liquidBaseAmount = BigInt(deposit.data.account.liquid.base.toString());
            const liquidQuoteAmount = BigInt(deposit.data.account.liquid.quote.toString());
            const lockedBaseAmount = BigInt(deposit.data.account.locked.base.toString());
            const lockedQuoteAmount = BigInt(deposit.data.account.locked.quote.toString());

            const balanceId = getHash(`${deposit.data.user.Address?.bits}-${ctx.contractAddress}`);

            let balance = await ctx.store.get(Balance, balanceId);

            if (balance) {
                balance.liquidBaseAmount = liquidBaseAmount,
                    balance.liquidQuoteAmount = liquidQuoteAmount,
                    balance.lockedBaseAmount = lockedBaseAmount,
                    balance.lockedQuoteAmount = lockedQuoteAmount
            } else {
                balance = new Balance({
                    id: balanceId,
                    user: deposit.data.user.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: liquidBaseAmount,
                    liquidQuoteAmount: liquidQuoteAmount,
                    lockedBaseAmount: lockedBaseAmount,
                    lockedQuoteAmount: lockedQuoteAmount
                });
            }
            await ctx.store.upsert(balance);

        })
        .onLogWithdrawEvent(async (withdraw, ctx) => {
            withdrawCounter.add(ctx, 1);

            const liquidBaseAmount = BigInt(withdraw.data.account.liquid.base.toString());
            const liquidQuoteAmount = BigInt(withdraw.data.account.liquid.quote.toString());
            const lockedBaseAmount = BigInt(withdraw.data.account.locked.base.toString());
            const lockedQuoteAmount = BigInt(withdraw.data.account.locked.quote.toString());

            const balanceId = getHash(`${withdraw.data.user.Address?.bits}-${ctx.contractAddress}`);

            let balance = await ctx.store.get(Balance, balanceId);

            if (balance) {
                balance.liquidBaseAmount = liquidBaseAmount,
                    balance.liquidQuoteAmount = liquidQuoteAmount,
                    balance.lockedBaseAmount = lockedBaseAmount,
                    balance.lockedQuoteAmount = lockedQuoteAmount
            } else {
                balance = new Balance({
                    id: balanceId,
                    user: withdraw.data.user.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: liquidBaseAmount,
                    liquidQuoteAmount: liquidQuoteAmount,
                    lockedBaseAmount: lockedBaseAmount,
                    lockedQuoteAmount: lockedQuoteAmount
                });
            }
            await ctx.store.upsert(balance);

        })
        .onLogWithdrawToMarketEvent(async (withdrawTo, ctx) => {
            withdrawToMarketCounter.add(ctx, 1);
            const liquidBaseAmount = BigInt(withdrawTo.data.account.liquid.base.toString());
            const liquidQuoteAmount = BigInt(withdrawTo.data.account.liquid.quote.toString());
            const lockedBaseAmount = BigInt(withdrawTo.data.account.locked.base.toString());
            const lockedQuoteAmount = BigInt(withdrawTo.data.account.locked.quote.toString());

            const balanceId = getHash(`${withdrawTo.data.user.Address?.bits}-${ctx.contractAddress}`);

            let balance = await ctx.store.get(Balance, balanceId);

            if (balance) {
                balance.liquidBaseAmount = liquidBaseAmount,
                    balance.liquidQuoteAmount = liquidQuoteAmount,
                    balance.lockedBaseAmount = lockedBaseAmount,
                    balance.lockedQuoteAmount = lockedQuoteAmount
            } else {
                balance = new Balance({
                    id: balanceId,
                    user: withdrawTo.data.user.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: liquidBaseAmount,
                    liquidQuoteAmount: liquidQuoteAmount,
                    lockedBaseAmount: lockedBaseAmount,
                    lockedQuoteAmount: lockedQuoteAmount
                });
            }
            await ctx.store.upsert(balance);
        })

        .onLogOpenOrderEvent(async (open, ctx: any) => {
            openOrderCounter.add(ctx, 1);

            const liquidBaseAmount = BigInt(open.data.balance.liquid.base.toString());
            const liquidQuoteAmount = BigInt(open.data.balance.liquid.quote.toString());
            const lockedBaseAmount = BigInt(open.data.balance.locked.base.toString());
            const lockedQuoteAmount = BigInt(open.data.balance.locked.quote.toString());

            const balanceId = getHash(`${open.data.user.Address?.bits}-${ctx.contractAddress}`);

            let balance = await ctx.store.get(Balance, balanceId);

            if (balance) {
                balance.liquidBaseAmount = liquidBaseAmount,
                    balance.liquidQuoteAmount = liquidQuoteAmount,
                    balance.lockedBaseAmount = lockedBaseAmount,
                    balance.lockedQuoteAmount = lockedQuoteAmount
            } else {
                balance = new Balance({
                    id: balanceId,
                    user: open.data.user.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: liquidBaseAmount,
                    liquidQuoteAmount: liquidQuoteAmount,
                    lockedBaseAmount: lockedBaseAmount,
                    lockedQuoteAmount: lockedQuoteAmount
                });
            }
            await ctx.store.upsert(balance);

        })
        .onLogCancelOrderEvent(async (cancel, ctx: any) => {
            cancelOrderCounter.add(ctx, 1);

            const liquidBaseAmount = BigInt(cancel.data.balance.liquid.base.toString());
            const liquidQuoteAmount = BigInt(cancel.data.balance.liquid.quote.toString());
            const lockedBaseAmount = BigInt(cancel.data.balance.locked.base.toString());
            const lockedQuoteAmount = BigInt(cancel.data.balance.locked.quote.toString());

            const balanceId = getHash(`${cancel.data.user.Address?.bits}-${ctx.contractAddress}`);

            let balance = await ctx.store.get(Balance, balanceId);

            if (balance) {
                balance.liquidBaseAmount = liquidBaseAmount,
                    balance.liquidQuoteAmount = liquidQuoteAmount,
                    balance.lockedBaseAmount = lockedBaseAmount,
                    balance.lockedQuoteAmount = lockedQuoteAmount
            } else {
                balance = new Balance({
                    id: balanceId,
                    user: cancel.data.user.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: liquidBaseAmount,
                    liquidQuoteAmount: liquidQuoteAmount,
                    lockedBaseAmount: lockedBaseAmount,
                    lockedQuoteAmount: lockedQuoteAmount
                });
            }
            await ctx.store.upsert(balance);

        })
        .onLogTradeOrderEvent(async (trade, ctx: any) => {
            tradeOrderCounter.add(ctx, 1);

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

            if (seller_balance) {
                seller_balance.liquidBaseAmount = seller_liquidBaseAmount,
                    seller_balance.liquidQuoteAmount = seller_liquidQuoteAmount,
                    seller_balance.lockedBaseAmount = seller_lockedBaseAmount,
                    seller_balance.lockedQuoteAmount = seller_lockedQuoteAmount
            } else {
                seller_balance = new Balance({
                    id: seller_balanceId,
                    user: trade.data.order_seller.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: seller_liquidBaseAmount,
                    liquidQuoteAmount: seller_liquidQuoteAmount,
                    lockedBaseAmount: seller_lockedBaseAmount,
                    lockedQuoteAmount: seller_lockedQuoteAmount
                });
            }
            await ctx.store.upsert(seller_balance);

            if (buyer_balance) {
                buyer_balance.liquidBaseAmount = buyer_liquidBaseAmount,
                    buyer_balance.liquidQuoteAmount = buyer_liquidQuoteAmount,
                    buyer_balance.lockedBaseAmount = buyer_lockedBaseAmount,
                    buyer_balance.lockedQuoteAmount = buyer_lockedQuoteAmount
            } else {
                buyer_balance = new Balance({
                    id: buyer_balanceId,
                    user: trade.data.order_buyer.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: buyer_liquidBaseAmount,
                    liquidQuoteAmount: buyer_liquidQuoteAmount,
                    lockedBaseAmount: buyer_lockedBaseAmount,
                    lockedQuoteAmount: buyer_lockedQuoteAmount
                });
            }
            await ctx.store.upsert(buyer_balance);
        })
        .onTimeInterval(async (block, ctx) => {
            const balances = await ctx.store.list(Balance, []);
            const filteredBalances = balances.filter(balance => balance.market === ctx.contractAddress);
            let TVL = BigDecimal(0);
            let quoteTVL = BigDecimal(0);
            let baseTVL = BigDecimal(0);

            for (const balance of filteredBalances) {
                const marketConfig = Object.values(marketsConfig).find(market => market.market === balance.market);

                if (!marketConfig) {
                    ctx.eventLogger.emit('MarketConfigNotFound', {
                        severity: LogLevel.ERROR,
                        message: `Market config not found for market address ${balance.market}`,
                    });
                    continue;
                }

                let baseTokenPrice = await getPriceBySymbol(marketConfig.baseTokenSymbol, new Date(ctx.timestamp));
                let quoteTokenPrice = await getPriceBySymbol(marketConfig.quoteTokenSymbol, new Date(ctx.timestamp));

                if (!baseTokenPrice) {
                    baseTokenPrice = marketConfig.defaultBasePrice;
                    ctx.eventLogger.emit('Default price', {
                        severity: LogLevel.INFO,
                        message: `Failed to load base token price for ${marketConfig.baseToken}. Using default price: ${marketConfig.defaultBasePrice}`,
                        token: marketConfig.baseTokenSymbol,
                        defaultPrice: marketConfig.defaultBasePrice.toString(),
                    });
                }

                if (!quoteTokenPrice) {
                    quoteTokenPrice = marketConfig.defaultQuotePrice;
                    ctx.eventLogger.emit('Default price', {
                        severity: LogLevel.INFO,
                        message: `Failed to load quote token price for ${marketConfig.quoteToken}. Using default price: ${marketConfig.defaultQuotePrice}`,
                        token: marketConfig.quoteTokenSymbol,
                        defaultPrice: marketConfig.defaultQuotePrice.toString(),
                    });
                }

                const baseBalanceAmount = balance.liquidBaseAmount + balance.lockedBaseAmount;
                const quoteBalanceAmount = balance.liquidQuoteAmount + balance.lockedQuoteAmount;

                const baseBalanceAmountBigDecimal = BigDecimal(baseBalanceAmount.toString()).div(BigDecimal(10).pow(marketConfig.baseDecimal));
                const quoteBalanceAmountBigDecimal = BigDecimal(quoteBalanceAmount.toString()).div(BigDecimal(10).pow(marketConfig.quoteDecimal));

                const balanceBaseTVL = baseBalanceAmountBigDecimal.multipliedBy(baseTokenPrice);
                const balanceQuoteTVL = quoteBalanceAmountBigDecimal.multipliedBy(quoteTokenPrice);
                const balanceTVL = balanceBaseTVL.plus(balanceQuoteTVL).toString();

                TVL = TVL.plus(balanceTVL);
                quoteTVL = quoteTVL.plus(balanceQuoteTVL);
                baseTVL = baseTVL.plus(balanceBaseTVL);

                ctx.meter.Gauge("total_tvl").record(TVL)
                ctx.meter.Gauge("total_quote_tvl").record(quoteTVL)
                ctx.meter.Gauge("total_base_tvl").record(baseTVL)

                const snapshotId = getHash(`${balance.user}-${ctx.contractAddress}-${ctx.transaction}`);
                const snapshot = new UserScoreSnapshot({
                    id: snapshotId,
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
                    block_date: new Date(ctx.timestamp).toISOString().slice(0, 19).replace('T', ' '),
                    chain_id: Number(ctx.chainId),
                    block_number: Number(block.height),
                    user_address: balance.user,
                    pool_address: ctx.contractAddress,
                    total_value_locked_score: Number(balanceTVL),
                    market_depth_score: undefined
                });
                await ctx.store.upsert(snapshot);
            }
        }, 60);
})
