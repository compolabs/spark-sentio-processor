import { SparkMarketProcessor } from "./types/fuel/SparkMarketProcessor.js";
import { FuelNetwork } from "@sentio/sdk/fuel";
import { BigDecimal, Counter, LogLevel } from "@sentio/sdk";
import crypto from "crypto";
import marketsConfig from './marketsConfig.json';
import { Balance, DailyVolume, Pools, TotalVolume, TradeEvent, UserScoreSnapshot } from './schema/store.js';
import { getPriceBySymbol } from "@sentio/sdk/utils";
import { MARKETS } from "./markets.js";
import { nanoid } from "nanoid";

// import { GLOBAL_CONFIG } from "@sentio/runtime"

// GLOBAL_CONFIG.execution = {
//     sequential: true,
// }
export const getHash = (data: string) => {
    return crypto.createHash("sha256").update(data).digest("hex");
};

const depositCounter = Counter.register("deposit");
const withdrawCounter = Counter.register("withdraw");
const withdrawToMarketCounter = Counter.register("withdrawToMarket");
const openOrderCounter = Counter.register("openOrder");
const cancelOrderCounter = Counter.register("cancelOrder");
const tradeOrderCounter = Counter.register("tradeOrder");
const shortCounter = Counter.register("shorts");
const longCounter = Counter.register("longs");

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
                    lockedQuoteAmount: lockedQuoteAmount,
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
                    lockedQuoteAmount: lockedQuoteAmount,
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
                    lockedQuoteAmount: lockedQuoteAmount,
                });
            }
            await ctx.store.upsert(balance);
        })

        .onLogOpenOrderEvent(async (open, ctx: any) => {
            openOrderCounter.add(ctx, 1);
            open.data.order_type === "Buy" ? longCounter.add(ctx, 1) : shortCounter.add(ctx, 1);

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
                    lockedQuoteAmount: lockedQuoteAmount,
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
                    lockedQuoteAmount: lockedQuoteAmount,
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
                    lockedQuoteAmount: seller_lockedQuoteAmount,
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
                    lockedQuoteAmount: buyer_lockedQuoteAmount,
                });
            }
            await ctx.store.upsert(buyer_balance);

            const eventVolume = BigDecimal(trade.data.trade_price.toString()).div(BigDecimal(10).pow(9)).multipliedBy(BigDecimal(trade.data.trade_size.toString()).div(BigDecimal(10).pow(9)));
            const tradeEvent = new TradeEvent({
                id: nanoid(),
                timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
                volume: eventVolume.toNumber()
            });
            await ctx.store.upsert(tradeEvent);
        })
        .onTimeInterval(async (block, ctx) => {
            const balances = await ctx.store.list(Balance, []);
            const filteredBalances = balances.filter(balance => balance.market === ctx.contractAddress);
            let TVL = BigDecimal(0);

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
                    baseTokenPrice = marketConfig.defaultBasePrice
                }
                if (!quoteTokenPrice) {
                    quoteTokenPrice = marketConfig.defaultQuotePrice
                }

                const baseBalanceAmount = balance.liquidBaseAmount + balance.lockedBaseAmount;
                const quoteBalanceAmount = balance.liquidQuoteAmount + balance.lockedQuoteAmount;

                const baseBalanceAmountBigDecimal = BigDecimal(baseBalanceAmount.toString()).div(BigDecimal(10).pow(marketConfig.baseDecimal));
                const quoteBalanceAmountBigDecimal = BigDecimal(quoteBalanceAmount.toString()).div(BigDecimal(10).pow(marketConfig.quoteDecimal));

                const balanceBaseTVL = baseBalanceAmountBigDecimal.multipliedBy(baseTokenPrice);
                const balanceQuoteTVL = quoteBalanceAmountBigDecimal.multipliedBy(quoteTokenPrice);
                const balanceTVL = balanceBaseTVL.plus(balanceQuoteTVL).toString();

                TVL = TVL.plus(balanceTVL);

                const snapshot = new UserScoreSnapshot({
                    id: getHash(`${balance.user}-${ctx.contractAddress}-${block.height}`),
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
                    block_date: new Date(ctx.timestamp).toISOString().slice(0, 19).replace('T', ' '),
                    chain_id: Number(ctx.chainId),
                    block_number: Number(block.height),
                    user_address: balance.user,
                    pool_address: ctx.contractAddress,
                    total_value_locked_score: Number(balanceTVL),
                    market_depth_score: undefined,
                });
                await ctx.store.upsert(snapshot);

                const pool = new Pools({
                    id: ctx.contractAddress,
                    chain_id: Number(ctx.chainId),
                    creation_block_number: 5813594,
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
                    pool_address: ctx.contractAddress,
                    lp_token_address: "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07",
                    lp_token_symbol: "ETH",
                    token_address: "0x286c479da40dc953bddc3bb4c453b608bba2e0ac483b077bd475174115395e6b",
                    token_symbol: "USDC",
                    token_decimals: "6",
                    token_index: 0,
                    fee_rate: 0.023,
                    dex_type: "Orderbook",
                });
                await ctx.store.upsert(pool);
            }
        }, 60, 60)
        .onTimeInterval(async (block, ctx) => {
            const balances = await ctx.store.list(Balance, []);
            const filteredBalances = balances.filter(balance => balance.market === ctx.contractAddress);
            let TVL = BigDecimal(0);
            let quoteTVL = BigDecimal(0);
            let baseTVL = BigDecimal(0);

            let lockedTVL = BigDecimal(0);
            let liquidTVL = BigDecimal(0);

            let baseAmountOnContract = BigDecimal(0);
            let baseAmountOnBalances = BigDecimal(0);
            let baseAmountOnOrders = BigDecimal(0);

            let dailyTradeVolume = BigDecimal(0);
            let totalTradeVolume = BigDecimal(0);

            const currentTimestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000);
            const oneDayAgoTimestamp = currentTimestamp - 86400;

            const allTradeEvents = await ctx.store.list(TradeEvent, []);

            const dailyTrades = allTradeEvents.filter(
                (trade) => trade.timestamp >= oneDayAgoTimestamp && trade.timestamp < currentTimestamp
            );

            for (const trade of dailyTrades) {
                dailyTradeVolume = dailyTradeVolume.plus(BigDecimal(trade.volume.toString()));
            }

            for (const trade of allTradeEvents) {
                totalTradeVolume = totalTradeVolume.plus(BigDecimal(trade.volume.toString()));
            }

            const dailyVolume = new DailyVolume({
                id: ctx.block?.id,
                timestamp: currentTimestamp,
                volume: dailyTradeVolume.toNumber(),
            });

            const totalVolume = new TotalVolume({
                id: ctx.block?.id,
                timestamp: currentTimestamp,
                volume: totalTradeVolume.toNumber(),
            });

            await ctx.store.upsert(totalVolume);
            await ctx.store.upsert(dailyVolume);

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
                    baseTokenPrice = marketConfig.defaultBasePrice
                }
                if (!quoteTokenPrice) {
                    quoteTokenPrice = marketConfig.defaultQuotePrice
                }

                const baseBalanceAmount = balance.liquidBaseAmount + balance.lockedBaseAmount;
                const quoteBalanceAmount = balance.liquidQuoteAmount + balance.lockedQuoteAmount;

                const baseBalanceAmountBigDecimal = BigDecimal(baseBalanceAmount.toString()).div(BigDecimal(10).pow(marketConfig.baseDecimal));
                const quoteBalanceAmountBigDecimal = BigDecimal(quoteBalanceAmount.toString()).div(BigDecimal(10).pow(marketConfig.quoteDecimal));


                const lockedBaseAmount = BigDecimal(balance.lockedBaseAmount.toString()).div(BigDecimal(10).pow(marketConfig.baseDecimal));
                const lockedQuoteAmount = BigDecimal(balance.lockedQuoteAmount.toString()).div(BigDecimal(10).pow(marketConfig.quoteDecimal));

                const liquidBaseAmount = BigDecimal(balance.liquidBaseAmount.toString()).div(BigDecimal(10).pow(marketConfig.baseDecimal));
                const liquidQuoteAmount = BigDecimal(balance.liquidQuoteAmount.toString()).div(BigDecimal(10).pow(marketConfig.quoteDecimal));

                const balanceLockedTVL = lockedBaseAmount.multipliedBy(baseTokenPrice).plus(lockedQuoteAmount.multipliedBy(quoteTokenPrice));
                const balanceLiquidTVL = liquidBaseAmount.multipliedBy(baseTokenPrice).plus(liquidQuoteAmount.multipliedBy(quoteTokenPrice));

                const balanceBaseTVL = baseBalanceAmountBigDecimal.multipliedBy(baseTokenPrice);
                const balanceQuoteTVL = quoteBalanceAmountBigDecimal.multipliedBy(quoteTokenPrice);
                const balanceTVL = balanceBaseTVL.plus(balanceQuoteTVL).toString();

                TVL = TVL.plus(balanceTVL);
                quoteTVL = quoteTVL.plus(balanceQuoteTVL);
                baseTVL = baseTVL.plus(balanceBaseTVL);

                lockedTVL = lockedTVL.plus(balanceLockedTVL);
                liquidTVL = liquidTVL.plus(balanceLiquidTVL);

                baseAmountOnContract = baseAmountOnContract.plus(baseBalanceAmountBigDecimal)
                baseAmountOnBalances = baseAmountOnBalances.plus(liquidBaseAmount)
                baseAmountOnOrders = baseAmountOnOrders.plus(lockedBaseAmount)

                ctx.meter.Gauge("total_tvl").record(TVL)
                ctx.meter.Gauge("total_quote_tvl").record(quoteTVL)
                ctx.meter.Gauge("total_base_tvl").record(baseTVL)
                ctx.meter.Gauge("total_locked_tvl").record(lockedTVL)
                ctx.meter.Gauge("total_liquid_tvl").record(liquidTVL)

                ctx.meter.Gauge("base_amount_on_contract").record(baseAmountOnContract)
                ctx.meter.Gauge("base_amount_on_balances").record(baseAmountOnBalances)
                ctx.meter.Gauge("base_amount_on_orders").record(baseAmountOnOrders)
            }
        }, 1, 1)
})
