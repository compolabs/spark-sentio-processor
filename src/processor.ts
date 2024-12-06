import { SparkMarketProcessor } from "./types/fuel/SparkMarketProcessor.js";
import { FuelNetwork } from "@sentio/sdk/fuel";
import { BigDecimal, Counter, LogLevel } from "@sentio/sdk";
import crypto from "crypto";
import { marketsConfig } from './marketsConfig.js';
import { ActiveOrder, Balance, DailyMarketVolume, DailyVolume, Pools, TotalMarketVolume, TotalVolume, TradeEvent, UserScoreSnapshot } from './schema/store.js';
import { getPriceBySymbol } from "@sentio/sdk/utils";
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
const totalEventsCounter = Counter.register("totalEvents");
const shortCounter = Counter.register("shorts");
const longCounter = Counter.register("longs");

Object.values(marketsConfig).forEach(config => {
    SparkMarketProcessor.bind({
        address: config.market,
        chainId: FuelNetwork.MAIN_NET,
    })
        .onLogDepositEvent(async (deposit, ctx) => {
            depositCounter.add(ctx, 1);
            totalEventsCounter.add(ctx, 1);

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
                    balance.lockedQuoteAmount = lockedQuoteAmount,
                    balance.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
            } else {
                balance = new Balance({
                    id: balanceId,
                    user: deposit.data.user.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: liquidBaseAmount,
                    liquidQuoteAmount: liquidQuoteAmount,
                    lockedBaseAmount: lockedBaseAmount,
                    lockedQuoteAmount: lockedQuoteAmount,
                    tradeVolume: 0,
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000)
                });
            }
            await ctx.store.upsert(balance);

        })
        .onLogWithdrawEvent(async (withdraw, ctx) => {
            withdrawCounter.add(ctx, 1);
            totalEventsCounter.add(ctx, 1);

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
                    balance.lockedQuoteAmount = lockedQuoteAmount,
                    balance.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
            } else {
                balance = new Balance({
                    id: balanceId,
                    user: withdraw.data.user.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: liquidBaseAmount,
                    liquidQuoteAmount: liquidQuoteAmount,
                    lockedBaseAmount: lockedBaseAmount,
                    lockedQuoteAmount: lockedQuoteAmount,
                    tradeVolume: 0,
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000)
                });
            }
            await ctx.store.upsert(balance);

        })
        .onLogWithdrawToMarketEvent(async (withdrawTo, ctx) => {
            withdrawToMarketCounter.add(ctx, 1);
            totalEventsCounter.add(ctx, 1);

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
                    balance.lockedQuoteAmount = lockedQuoteAmount,
                    balance.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
            } else {
                balance = new Balance({
                    id: balanceId,
                    user: withdrawTo.data.user.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: liquidBaseAmount,
                    liquidQuoteAmount: liquidQuoteAmount,
                    lockedBaseAmount: lockedBaseAmount,
                    lockedQuoteAmount: lockedQuoteAmount,
                    tradeVolume: 0,
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000)
                });
            }
            await ctx.store.upsert(balance);
        })

        .onLogOpenOrderEvent(async (open, ctx: any) => {
            openOrderCounter.add(ctx, 1);
            totalEventsCounter.add(ctx, 1);

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
                    balance.lockedQuoteAmount = lockedQuoteAmount,
                    balance.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
            } else {
                balance = new Balance({
                    id: balanceId,
                    user: open.data.user.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: liquidBaseAmount,
                    liquidQuoteAmount: liquidQuoteAmount,
                    lockedBaseAmount: lockedBaseAmount,
                    lockedQuoteAmount: lockedQuoteAmount,
                    tradeVolume: 0,
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000)
                });
            }
            await ctx.store.upsert(balance);

            const order = new ActiveOrder({
                id: open.data.order_id,
                market: ctx.contractAddress,
                user: open.data.user.Address?.bits,
                amount: BigInt(open.data.amount.toString()),
                price: BigInt(open.data.price.toString())
            })
            await ctx.store.upsert(order);
        })
        .onLogCancelOrderEvent(async (cancel, ctx: any) => {
            cancelOrderCounter.add(ctx, 1);
            totalEventsCounter.add(ctx, 1);

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
                    balance.lockedQuoteAmount = lockedQuoteAmount,
                    balance.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
            } else {
                balance = new Balance({
                    id: balanceId,
                    user: cancel.data.user.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: liquidBaseAmount,
                    liquidQuoteAmount: liquidQuoteAmount,
                    lockedBaseAmount: lockedBaseAmount,
                    lockedQuoteAmount: lockedQuoteAmount,
                    tradeVolume: 0,
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000)
                });
            }
            await ctx.store.upsert(balance);

            await ctx.store.delete(cancel.data.order_id);
        })
        .onLogTradeOrderEvent(async (trade, ctx: any) => {
            tradeOrderCounter.add(ctx, 1);
            totalEventsCounter.add(ctx, 1);

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

            let sell_order = await ctx.store.get(ActiveOrder, trade.data.base_sell_order_id)
            let buy_order = await ctx.store.get(ActiveOrder, trade.data.base_buy_order_id)


            if (!sell_order || !buy_order) {
                throw new Error("Sell order or buy order not found");
            }

            if (seller_balance) {
                seller_balance.liquidBaseAmount = seller_liquidBaseAmount,
                    seller_balance.liquidQuoteAmount = seller_liquidQuoteAmount,
                    seller_balance.lockedBaseAmount = seller_lockedBaseAmount,
                    seller_balance.lockedQuoteAmount = seller_lockedQuoteAmount,
                    seller_balance.tradeVolume = BigDecimal(seller_balance.tradeVolume.toString()).plus(BigDecimal(trade.data.trade_price.toString()).div(BigDecimal(10).pow(9)).multipliedBy(BigDecimal(trade.data.trade_size.toString()).div(BigDecimal(10).pow(config.baseDecimal)))),
                    seller_balance.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
            } else {
                seller_balance = new Balance({
                    id: seller_balanceId,
                    user: trade.data.order_seller.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: seller_liquidBaseAmount,
                    liquidQuoteAmount: seller_liquidQuoteAmount,
                    lockedBaseAmount: seller_lockedBaseAmount,
                    lockedQuoteAmount: seller_lockedQuoteAmount,
                    tradeVolume: 0,
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000)
                });
            }
            await ctx.store.upsert(seller_balance);

            if (buyer_balance) {
                buyer_balance.liquidBaseAmount = buyer_liquidBaseAmount,
                    buyer_balance.liquidQuoteAmount = buyer_liquidQuoteAmount,
                    buyer_balance.lockedBaseAmount = buyer_lockedBaseAmount,
                    buyer_balance.lockedQuoteAmount = buyer_lockedQuoteAmount,
                    buyer_balance.tradeVolume = BigDecimal(buyer_balance.tradeVolume.toString()).plus(BigDecimal(trade.data.trade_price.toString()).div(BigDecimal(10).pow(config.priceDecimal)).multipliedBy(BigDecimal(trade.data.trade_size.toString()).div(BigDecimal(10).pow(config.baseDecimal)))),
                    buyer_balance.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
            } else {
                buyer_balance = new Balance({
                    id: buyer_balanceId,
                    user: trade.data.order_buyer.Address?.bits,
                    market: ctx.contractAddress,
                    liquidBaseAmount: buyer_liquidBaseAmount,
                    liquidQuoteAmount: buyer_liquidQuoteAmount,
                    lockedBaseAmount: buyer_lockedBaseAmount,
                    lockedQuoteAmount: buyer_lockedQuoteAmount,
                    tradeVolume: 0,
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000)
                });
            }
            await ctx.store.upsert(buyer_balance);

            const eventVolume = BigDecimal(trade.data.trade_price.toString()).div(BigDecimal(10).pow(config.priceDecimal)).multipliedBy(BigDecimal(trade.data.trade_size.toString()).div(BigDecimal(10).pow(config.baseDecimal)));
            const tradeEvent = new TradeEvent({
                id: nanoid(),
                market: ctx.contractAddress,
                timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
                volume: eventVolume.toNumber(),
                seller: trade.data.order_seller.Address?.bits,
                buyer: trade.data.order_buyer.Address?.bits
            });
            await ctx.store.upsert(tradeEvent);

            if (buy_order && sell_order) {

                const updatedBuyAmount = buy_order.amount - BigInt(trade.data.trade_size.toString());
                const updatedSellAmount = sell_order.amount - BigInt(trade.data.trade_size.toString());

                const isBuyOrderClosed = updatedBuyAmount === BigInt(0);
                const isSellOrderClosed = updatedSellAmount === BigInt(0);

                const updatedBuyOrder: ActiveOrder = {
                    ...buy_order,
                    amount: updatedBuyAmount.toString(),
                };
                ctx.store.upsert(updatedBuyOrder);

                const updatedSellOrder: ActiveOrder = {
                    ...sell_order,
                    amount: updatedSellAmount.toString(),
                };
                ctx.store.upsert(updatedSellOrder);

                if (isBuyOrderClosed) {
                    ctx.store.delete(buy_order.id);
                }

                if (isSellOrderClosed) {
                    ctx.store.delete(sell_order.id);
                }
            }
        })
        .onTimeInterval(async (block, ctx) => {
            const balances = await ctx.store.list(Balance, []);
            const marketBalances = balances.filter(balance => balance.market === ctx.contractAddress);

            for (const balance of marketBalances) {
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
                    tradeVolume: balance.tradeVolume
                });
                await ctx.store.upsert(snapshot);

                const pool = new Pools({
                    id: ctx.contractAddress,
                    chain_id: Number(ctx.chainId),
                    creation_block_number: config.creationBlockNumber,
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
                    pool_address: ctx.contractAddress,
                    lp_token_address: config.baseToken,
                    lp_token_symbol: config.baseTokenSymbol,
                    token_address: config.quoteToken,
                    token_symbol: config.quoteTokenSymbol,
                    token_decimals: config.quoteDecimal,
                    token_index: 0,
                    fee_rate: config.feeRate,
                    dex_type: config.dexType,
                });
                await ctx.store.upsert(pool);
            }
        }, 60, 60)
    // .onTimeInterval(async (block, ctx) => {
    //     const balances = await ctx.store.list(Balance, []);
    //     const marketBalances = balances.filter(balance => balance.market === ctx.contractAddress);

    //     let TVL = BigDecimal(0);
    //     let quoteTVL = BigDecimal(0);
    //     let baseTVL = BigDecimal(0);

    //     let lockedTVL = BigDecimal(0);
    //     let liquidTVL = BigDecimal(0);

    //     let baseAmountOnContract = BigDecimal(0);
    //     let baseAmountOnBalances = BigDecimal(0);
    //     let baseAmountOnOrders = BigDecimal(0);

    //     let dailyTradeVolume = BigDecimal(0);
    //     let dailyMarketTradeVolume = BigDecimal(0);

    //     let totalTradeVolume = BigDecimal(0);
    //     let totalMarketTradeVolume = BigDecimal(0);

    //     const currentTimestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000);
    //     const oneDayAgoTimestamp = currentTimestamp - 86400;

    //     const protocolTrades = await ctx.store.list(TradeEvent, []);
    //     const marketTrades = protocolTrades.filter(trade => trade.market === ctx.contractAddress);


    //     const dailyProtocolTrades = protocolTrades.filter(
    //         (trade) => trade.timestamp >= oneDayAgoTimestamp && trade.timestamp < currentTimestamp
    //     );

    //     const dailyMarketTrades = marketTrades.filter(
    //         (trade) => trade.timestamp >= oneDayAgoTimestamp && trade.timestamp < currentTimestamp
    //     );


    //     for (const trade of dailyProtocolTrades) {
    //         dailyTradeVolume = dailyTradeVolume.plus(BigDecimal(trade.volume.toString()));
    //     }

    //     for (const trade of dailyMarketTrades) {
    //         dailyMarketTradeVolume = dailyMarketTradeVolume.plus(BigDecimal(trade.volume.toString()));
    //     }

    //     for (const trade of protocolTrades) {
    //         totalTradeVolume = totalTradeVolume.plus(BigDecimal(trade.volume.toString()));
    //     }

    //     for (const trade of marketTrades) {
    //         totalMarketTradeVolume = totalMarketTradeVolume.plus(BigDecimal(trade.volume.toString()));
    //     }

    //     const dailyVolume = new DailyVolume({
    //         id: ctx.block?.id,
    //         timestamp: currentTimestamp,
    //         volume: dailyTradeVolume.toNumber(),
    //     });

    //     const dailyMarketVolume = new DailyMarketVolume({
    //         id: ctx.block?.id,
    //         market: ctx.contractAddress,
    //         timestamp: currentTimestamp,
    //         volume: dailyMarketTradeVolume.toNumber(),
    //     });

    //     const totalVolume = new TotalVolume({
    //         id: ctx.block?.id,
    //         timestamp: currentTimestamp,
    //         volume: totalTradeVolume.toNumber(),
    //     });

    //     const totalMarketVolume = new TotalMarketVolume({
    //         id: ctx.block?.id,
    //         market: ctx.contractAddress,
    //         timestamp: currentTimestamp,
    //         volume: totalMarketTradeVolume.toNumber(),
    //     });

    //     await ctx.store.upsert(totalVolume);
    //     await ctx.store.upsert(totalMarketVolume);
    //     await ctx.store.upsert(dailyVolume);
    //     await ctx.store.upsert(dailyMarketVolume);

    //     for (const balance of marketBalances) {
    //         const marketConfig = Object.values(marketsConfig).find(market => market.market === balance.market);

    //         if (!marketConfig) {
    //             ctx.eventLogger.emit('MarketConfigNotFound', {
    //                 severity: LogLevel.ERROR,
    //                 message: `Market config not found for market address ${balance.market}`,
    //             });
    //             continue;
    //         }

    //         let baseTokenPrice = await getPriceBySymbol(marketConfig.baseTokenSymbol, new Date(ctx.timestamp));
    //         let quoteTokenPrice = await getPriceBySymbol(marketConfig.quoteTokenSymbol, new Date(ctx.timestamp));
    //         if (!baseTokenPrice) {
    //             baseTokenPrice = marketConfig.defaultBasePrice
    //         }
    //         if (!quoteTokenPrice) {
    //             quoteTokenPrice = marketConfig.defaultQuotePrice
    //         }

    //         const baseBalanceAmount = balance.liquidBaseAmount + balance.lockedBaseAmount;
    //         const quoteBalanceAmount = balance.liquidQuoteAmount + balance.lockedQuoteAmount;

    //         const baseBalanceAmountBigDecimal = BigDecimal(baseBalanceAmount.toString()).div(BigDecimal(10).pow(marketConfig.baseDecimal));
    //         const quoteBalanceAmountBigDecimal = BigDecimal(quoteBalanceAmount.toString()).div(BigDecimal(10).pow(marketConfig.quoteDecimal));


    //         const lockedBaseAmount = BigDecimal(balance.lockedBaseAmount.toString()).div(BigDecimal(10).pow(marketConfig.baseDecimal));
    //         const lockedQuoteAmount = BigDecimal(balance.lockedQuoteAmount.toString()).div(BigDecimal(10).pow(marketConfig.quoteDecimal));

    //         const liquidBaseAmount = BigDecimal(balance.liquidBaseAmount.toString()).div(BigDecimal(10).pow(marketConfig.baseDecimal));
    //         const liquidQuoteAmount = BigDecimal(balance.liquidQuoteAmount.toString()).div(BigDecimal(10).pow(marketConfig.quoteDecimal));

    //         const balanceLockedTVL = lockedBaseAmount.multipliedBy(baseTokenPrice).plus(lockedQuoteAmount.multipliedBy(quoteTokenPrice));
    //         const balanceLiquidTVL = liquidBaseAmount.multipliedBy(baseTokenPrice).plus(liquidQuoteAmount.multipliedBy(quoteTokenPrice));

    //         const balanceBaseTVL = baseBalanceAmountBigDecimal.multipliedBy(baseTokenPrice);
    //         const balanceQuoteTVL = quoteBalanceAmountBigDecimal.multipliedBy(quoteTokenPrice);
    //         const balanceTVL = balanceBaseTVL.plus(balanceQuoteTVL).toString();

    //         TVL = TVL.plus(balanceTVL);
    //         quoteTVL = quoteTVL.plus(balanceQuoteTVL);
    //         baseTVL = baseTVL.plus(balanceBaseTVL);

    //         lockedTVL = lockedTVL.plus(balanceLockedTVL);
    //         liquidTVL = liquidTVL.plus(balanceLiquidTVL);

    //         baseAmountOnContract = baseAmountOnContract.plus(baseBalanceAmountBigDecimal)
    //         baseAmountOnBalances = baseAmountOnBalances.plus(liquidBaseAmount)
    //         baseAmountOnOrders = baseAmountOnOrders.plus(lockedBaseAmount)

    //         ctx.meter.Gauge("total_tvl").record(TVL)
    //         ctx.meter.Gauge("total_quote_tvl").record(quoteTVL)
    //         ctx.meter.Gauge("total_base_tvl").record(baseTVL)
    //         ctx.meter.Gauge("total_locked_tvl").record(lockedTVL)
    //         ctx.meter.Gauge("total_liquid_tvl").record(liquidTVL)

    //         ctx.meter.Gauge("base_amount_on_contract").record(baseAmountOnContract)
    //         ctx.meter.Gauge("base_amount_on_balances").record(baseAmountOnBalances)
    //         ctx.meter.Gauge("base_amount_on_orders").record(baseAmountOnOrders)
    //     }
    // }, 1, 1)
})
