import { SparkMarketProcessor } from "./types/fuel/SparkMarketProcessor.js";
import { FuelNetwork } from "@sentio/sdk/fuel";
import { BigDecimal, Counter, LogLevel } from "@sentio/sdk";
import { marketsConfig } from './marketsConfig.js';
import { Balance, DailyMarketVolume, DailyVolume, Order, OrderStatus, OrderType, Pools, TotalMarketVolume, TotalVolume, TradeEvent, UserScoreSnapshot } from './schema/store.js';
import { getPriceBySymbol } from "@sentio/sdk/utils";
import { nanoid } from "nanoid";
import { calculatePercentile, getHash, getPricesLastWeek, updateBalance } from "./utils.js";
import { GLOBAL_CONFIG } from "@sentio/runtime"

GLOBAL_CONFIG.execution = {
    sequential: true,
}

const depositCounter = Counter.register("deposit");
const withdrawCounter = Counter.register("withdraw");
const withdrawToMarketCounter = Counter.register("withdrawToMarket");
const openOrderCounter = Counter.register("openOrder");
const cancelOrderCounter = Counter.register("cancelOrder");
const tradeOrderCounter = Counter.register("tradeOrder");
const totalEventsCounter = Counter.register("totalEvents");

const totalBaseDeposited = Counter.register("totalBaseDeposited");
const totalQuoteDeposited = Counter.register("totalQuoteDeposited");

const totalBaseWithdrawn = Counter.register("totalBaseWithdrawn");
const totalQuoteWithdrawn = Counter.register("totalQuoteWithdrawn");

const totalBaseWithdrawnTo = Counter.register("totalBaseWithdrawnTo");
const totalQuoteWithdrawnTo = Counter.register("totalQuoteWithdrawnTo");

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

        const price = deposit.data.asset.bits === config.baseToken
            ? await getPriceBySymbol(config.baseTokenSymbol, new Date(ctx.timestamp)) || config.defaultBasePrice
            : await getPriceBySymbol(config.quoteTokenSymbol, new Date(ctx.timestamp)) || config.defaultQuotePrice;
        console.log("deposit price", deposit.data.asset.bits, price)
        deposit.data.asset.bits === config.baseToken
            ? totalBaseDeposited.add(ctx, BigDecimal(deposit.data.amount.toString()).div(BigDecimal(10).pow(config.baseDecimal)).multipliedBy(price))
            : totalQuoteDeposited.add(ctx,BigDecimal(deposit.data.amount.toString()).div(BigDecimal(10).pow(config.quoteDecimal)).multipliedBy(price))

            const balanceId = getHash(`${deposit.data.user.Address?.bits}-${ctx.contractAddress}`);
            let balance = await ctx.store.get(Balance, balanceId);

            const liquidBaseAmount = BigInt(deposit.data.account.liquid.base.toString());
            const liquidQuoteAmount = BigInt(deposit.data.account.liquid.quote.toString());
            const lockedBaseAmount = BigInt(deposit.data.account.locked.base.toString());
            const lockedQuoteAmount = BigInt(deposit.data.account.locked.quote.toString());
            await updateBalance(config, deposit, ctx, balance, balanceId, liquidBaseAmount, liquidQuoteAmount, lockedBaseAmount, lockedQuoteAmount);
        })
        .onLogWithdrawEvent(async (withdraw, ctx) => {
            withdrawCounter.add(ctx, 1);
            totalEventsCounter.add(ctx, 1);

            const price = withdraw.data.asset.bits === config.baseToken
                ? await getPriceBySymbol(config.baseTokenSymbol, new Date(ctx.timestamp)) || config.defaultBasePrice
                : await getPriceBySymbol(config.quoteTokenSymbol, new Date(ctx.timestamp)) || config.defaultQuotePrice;
           
            withdraw.data.asset.bits === config.baseToken
                ? totalBaseWithdrawn.add(ctx, BigDecimal(withdraw.data.amount.toString()).div(BigDecimal(10).pow(config.baseDecimal)).multipliedBy(price))
                : totalQuoteWithdrawn.add(ctx, BigDecimal(withdraw.data.amount.toString()).div(BigDecimal(10).pow(config.quoteDecimal)).multipliedBy(price))
            
            const balanceId = getHash(`${withdraw.data.user.Address?.bits}-${ctx.contractAddress}`);
            let balance = await ctx.store.get(Balance, balanceId);

            const liquidBaseAmount = BigInt(withdraw.data.account.liquid.base.toString());
            const liquidQuoteAmount = BigInt(withdraw.data.account.liquid.quote.toString());
            const lockedBaseAmount = BigInt(withdraw.data.account.locked.base.toString());
            const lockedQuoteAmount = BigInt(withdraw.data.account.locked.quote.toString());
            await updateBalance(config, withdraw, ctx, balance, balanceId, liquidBaseAmount, liquidQuoteAmount, lockedBaseAmount, lockedQuoteAmount);
        })
        .onLogWithdrawToMarketEvent(async (withdrawTo, ctx) => {
            withdrawToMarketCounter.add(ctx, 1);
            totalEventsCounter.add(ctx, 1);
            const price = withdrawTo.data.asset.bits === config.baseToken
                ? await getPriceBySymbol(config.baseTokenSymbol, new Date(ctx.timestamp)) || config.defaultBasePrice
                : await getPriceBySymbol(config.quoteTokenSymbol, new Date(ctx.timestamp)) || config.defaultQuotePrice;
            
            withdrawTo.data.asset.bits === config.baseToken
                ? totalBaseWithdrawnTo.add(ctx, BigDecimal(withdrawTo.data.amount.toString()).div(BigDecimal(10).pow(config.baseDecimal)).multipliedBy(price))
                : totalQuoteWithdrawnTo.add(ctx, BigDecimal(withdrawTo.data.amount.toString()).div(BigDecimal(10).pow(config.quoteDecimal)).multipliedBy(price))
            
            const balanceId = getHash(`${withdrawTo.data.user.Address?.bits}-${ctx.contractAddress}`);
            
            let balance = await ctx.store.get(Balance, balanceId);

            const liquidBaseAmount = BigInt(withdrawTo.data.account.liquid.base.toString());
            const liquidQuoteAmount = BigInt(withdrawTo.data.account.liquid.quote.toString());
            const lockedBaseAmount = BigInt(withdrawTo.data.account.locked.base.toString());
            const lockedQuoteAmount = BigInt(withdrawTo.data.account.locked.quote.toString());
            await updateBalance(config, withdrawTo, ctx, balance, balanceId, liquidBaseAmount, liquidQuoteAmount, lockedBaseAmount, lockedQuoteAmount);
        })
        .onLogOpenOrderEvent(async (open, ctx: any) => {
            openOrderCounter.add(ctx, 1);
            totalEventsCounter.add(ctx, 1);
            open.data.order_type === "Buy" ? longCounter.add(ctx, 1) : shortCounter.add(ctx, 1);
            const balanceId = getHash(`${open.data.user.Address?.bits}-${ctx.contractAddress}`);
            let balance = await ctx.store.get(Balance, balanceId);

            const liquidBaseAmount = BigInt(open.data.balance.liquid.base.toString());
            const liquidQuoteAmount = BigInt(open.data.balance.liquid.quote.toString());
            const lockedBaseAmount = BigInt(open.data.balance.locked.base.toString());
            const lockedQuoteAmount = BigInt(open.data.balance.locked.quote.toString());
            await updateBalance(config, open, ctx, balance, balanceId, liquidBaseAmount, liquidQuoteAmount, lockedBaseAmount, lockedQuoteAmount);
            
            const order = new Order({
                id: open.data.order_id,
                market: ctx.contractAddress,
                amount: BigInt(open.data.amount.toString()),
                price: BigInt(open.data.price.toString()),
                user: open.data.user.Address?.bits as string,
                status: OrderStatus.Active,
                orderType: open.data.order_type as unknown as OrderType,
                initialAmount: BigInt(open.data.amount.toString()),
                timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
                initialTimestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
            })
            await ctx.store.upsert(order);
            // console.log("OPEN ORDER", open.data.order_id);
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
            
            let sell_order = await ctx.store.get(Order, trade.data.base_sell_order_id);
            let buy_order = await ctx.store.get(Order, trade.data.base_buy_order_id);
            
            if (sell_order) {
                const updatedActiveSellAmount = BigInt(sell_order.amount.toString()) - BigInt(trade.data.trade_size.toString());
                const isActiveSellOrderClosed = updatedActiveSellAmount === 0n;
                
                if (isActiveSellOrderClosed) {
                    sell_order.amount = 0n
                    sell_order.status = OrderStatus.Closed
                    sell_order.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
                } else {
                    sell_order.amount = updatedActiveSellAmount;
                    sell_order.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
                }
                await ctx.store.upsert(sell_order);
            } else {
                console.log("NO SELL ORDER FOR TRADE", trade.data.base_sell_order_id);
            }
            
            if (buy_order) {
                const updatedActiveBuyAmount = BigInt(buy_order.amount.toString()) - BigInt(trade.data.trade_size.toString());
                const isActiveBuyOrderClosed = updatedActiveBuyAmount === 0n;
                
                if (isActiveBuyOrderClosed) {
                    buy_order.amount = 0n
                    buy_order.status = OrderStatus.Closed
                    buy_order.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
                } else {
                    buy_order.amount = updatedActiveBuyAmount;
                    buy_order.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
                }
                await ctx.store.upsert(buy_order);
            } else {
                console.log("NO BUY ORDER FOR TRADE", trade.data.base_buy_order_id);
            }
            
            await updateBalance(config, trade, ctx, seller_balance, seller_balanceId, seller_liquidBaseAmount, seller_liquidQuoteAmount, seller_lockedBaseAmount, seller_lockedQuoteAmount);
            await updateBalance(config, trade, ctx, buyer_balance, buyer_balanceId, buyer_liquidBaseAmount, buyer_liquidQuoteAmount, buyer_lockedBaseAmount, buyer_lockedQuoteAmount);
            
            const eventVolume = BigDecimal(trade.data.trade_price.toString()).div(BigDecimal(10).pow(config.priceDecimal)).multipliedBy(BigDecimal(trade.data.trade_size.toString()).div(BigDecimal(10).pow(config.baseDecimal)));
            const tradeEvent = new TradeEvent({
                id: nanoid(),
                market: ctx.contractAddress,
                timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
                price: parseFloat(BigDecimal(trade.data.trade_price.toString()).div(BigDecimal(10).pow(config.priceDecimal)).toString()),
                amount: parseFloat(BigDecimal(trade.data.trade_size.toString()).div(BigDecimal(10).pow(config.baseDecimal)).toString()),
                volume: eventVolume.toNumber(),
                seller: trade.data.order_seller.Address?.bits as string,
                buyer: trade.data.order_buyer.Address?.bits as string,
            });
            await ctx.store.upsert(tradeEvent);
        })
        .onLogCancelOrderEvent(async (cancel, ctx: any) => {
            cancelOrderCounter.add(ctx, 1);
            totalEventsCounter.add(ctx, 1);
            const balanceId = getHash(`${cancel.data.user.Address?.bits}-${ctx.contractAddress}`);
            let balance = await ctx.store.get(Balance, balanceId);
            let order = await ctx.store.get(Order, cancel.data.order_id);
            if (order) {
                order.amount = 0n
                order.status = OrderStatus.Canceled
                order.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
                await ctx.store.upsert(order)
            } else {
                console.log("NO ORDER FOR CANCEL", cancel.data.order_id);
            }

            const liquidBaseAmount = BigInt(cancel.data.balance.liquid.base.toString());
            const liquidQuoteAmount = BigInt(cancel.data.balance.liquid.quote.toString());
            const lockedBaseAmount = BigInt(cancel.data.balance.locked.base.toString());
            const lockedQuoteAmount = BigInt(cancel.data.balance.locked.quote.toString());

            await updateBalance(config, cancel, ctx, balance, balanceId, liquidBaseAmount, liquidQuoteAmount, lockedBaseAmount, lockedQuoteAmount);
        })
        .onTimeInterval(async (block, ctx) => {
            const baseTokenPrice = await getPriceBySymbol(config.baseTokenSymbol, new Date(ctx.timestamp)) || config.defaultBasePrice;
            const quoteTokenPrice = await getPriceBySymbol(config.quoteTokenSymbol, new Date(ctx.timestamp)) || config.defaultQuotePrice;
            const orders = await ctx.store.list(Order, []);
            const marketActiveOrders = orders.filter(order => order.market === ctx.contractAddress && order.status === "Active");

            const historicalBasePrices = await getPricesLastWeek(config.baseTokenSymbol, ctx);
            console.log("historicalBasePrices:", historicalBasePrices);

            const basePriceChanges = historicalBasePrices.map((price, index, arr) => {
                if (index === 0) return 0;
                return Math.abs(arr[index] - arr[index - 1]);
            });
            console.log("Base price changes:", basePriceChanges);

            const percentile = calculatePercentile(basePriceChanges, 95, ctx);

            const lowerLimit = baseTokenPrice * (1 - percentile / 100);
            const upperLimit = baseTokenPrice * (1 + percentile / 100);
            console.log("limits:", baseTokenPrice, percentile, lowerLimit, upperLimit, ctx.contractAddress);

            const userOrdersMap = marketActiveOrders.reduce((map: Record<string, Order[]>, order) => {
                if (!map[order.user]) {
                    map[order.user] = [];
                }
                map[order.user].push(order);
                return map;
            }, {});

            for (const user in userOrdersMap) {
                const userOrders = userOrdersMap[user];
                // console.log("userOrders", userOrders)

                // if (userOrders.length === 0) continue;

                // const marketConfig = Object.values(marketsConfig).find(market => market.market === userOrders[0].market);
                // if (!marketConfig) {
                //     console.log("Market config not found for market", userOrders[0].market);
                //     continue;
                // }

                const userBaseTVL = userOrders.reduce((totalBase, userOrder) => {
                    const orderPrice = Number(userOrder.price) / Math.pow(10, Number(config.priceDecimal));
                    if (userOrder.orderType === "Sell" && orderPrice >= lowerLimit && orderPrice <= upperLimit) {
                        const orderValue = (Number(userOrder.amount) / Math.pow(10, Number(config.baseDecimal))) * Number(baseTokenPrice);
                        return totalBase + orderValue;
                    }
                    return totalBase;
                }, 0);

                const userQuoteTVL = userOrders.reduce((totalQuote, userOrder) => {
                    const orderPrice = Number(userOrder.price) / Math.pow(10, Number(config.priceDecimal));
                    if (userOrder.orderType === "Buy" && orderPrice >= lowerLimit && orderPrice <= upperLimit) {
                        const orderValue = (Number(userOrder.amount) / Math.pow(10, Number(config.baseDecimal))) * Number(quoteTokenPrice);
                        return totalQuote + orderValue;
                    }
                    return totalQuote;
                }, 0);

                const snapshot = new UserScoreSnapshot({
                    id: getHash(`${user}-${ctx.contractAddress}-${block.height}`),
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
                    block_date: new Date(ctx.timestamp).toISOString().slice(0, 19).replace('T', ' '),
                    chain_id: Number(ctx.chainId),
                    block_number: Number(block.height),
                    user_address: user,
                    pool_address: ctx.contractAddress,
                    total_value_locked_score: userBaseTVL + userQuoteTVL,
                    market_depth_score: undefined,
                });
                await ctx.store.upsert(snapshot);
            }

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
        }, 60, 60)
        .onTimeInterval(async (block, ctx) => {
            const balances = await ctx.store.list(Balance, []);
            const marketBalances = balances.filter(balance => balance.market === ctx.contractAddress);

            let TVL = BigDecimal(0);
            let TVLInOrders = BigDecimal(0);
            
            let quoteTVL = BigDecimal(0);
            let baseTVL = BigDecimal(0);

            let lockedTVL = BigDecimal(0);
            let liquidTVL = BigDecimal(0);

            let baseAmountOnContract = BigDecimal(0);
            let baseAmountOnBalances = BigDecimal(0);
            let baseAmountOnOrders = BigDecimal(0);

            let dailyTradeVolume = BigDecimal(0);
            let dailyMarketTradeVolume = BigDecimal(0);

            let totalTradeVolume = BigDecimal(0);
            let totalMarketTradeVolume = BigDecimal(0);

            const currentTimestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000);
            const oneDayAgoTimestamp = currentTimestamp - 86400;

            const protocolTrades = await ctx.store.list(TradeEvent, []);
            const marketTrades = protocolTrades.filter(trade => trade.market === ctx.contractAddress);


            const dailyProtocolTrades = protocolTrades.filter(
                (trade) => trade.timestamp >= oneDayAgoTimestamp && trade.timestamp < currentTimestamp
            );

            const dailyMarketTrades = marketTrades.filter(
                (trade) => trade.timestamp >= oneDayAgoTimestamp && trade.timestamp < currentTimestamp
            );


            for (const trade of dailyProtocolTrades) {
                dailyTradeVolume = dailyTradeVolume.plus(BigDecimal(trade.volume.toString()));
            }

            for (const trade of dailyMarketTrades) {
                dailyMarketTradeVolume = dailyMarketTradeVolume.plus(BigDecimal(trade.volume.toString()));
            }

            for (const trade of protocolTrades) {
                totalTradeVolume = totalTradeVolume.plus(BigDecimal(trade.volume.toString()));
            }

            for (const trade of marketTrades) {
                totalMarketTradeVolume = totalMarketTradeVolume.plus(BigDecimal(trade.volume.toString()));
            }

            const dailyVolume = new DailyVolume({
                id: ctx.block?.id as string,
                timestamp: currentTimestamp,
                volume: dailyTradeVolume.toNumber(),
            });

            const dailyMarketVolume = new DailyMarketVolume({
                id: ctx.block?.id as string,
                market: ctx.contractAddress,
                timestamp: currentTimestamp,
                volume: dailyMarketTradeVolume.toNumber(),
            });

            const totalVolume = new TotalVolume({
                id: ctx.block?.id as string,
                timestamp: currentTimestamp,
                volume: totalTradeVolume.toNumber(),
            });

            const totalMarketVolume = new TotalMarketVolume({
                id: ctx.block?.id as string,
                market: ctx.contractAddress,
                timestamp: currentTimestamp,
                volume: totalMarketTradeVolume.toNumber(),
            });

            await ctx.store.upsert(totalVolume);
            await ctx.store.upsert(totalMarketVolume);
            await ctx.store.upsert(dailyVolume);
            await ctx.store.upsert(dailyMarketVolume);

            for (const balance of marketBalances) {
                // const marketConfig = Object.values(marketsConfig).find(market => market.market === balance.market);

                // if (!marketConfig) {
                //     ctx.eventLogger.emit('MarketConfigNotFound', {
                //         severity: LogLevel.ERROR,
                //         message: `Market config not found for market address ${balance.market}`,
                //     });
                //     continue;
                // }

                let baseTokenPrice = await getPriceBySymbol(config.baseTokenSymbol, new Date(ctx.timestamp));
                let quoteTokenPrice = await getPriceBySymbol(config.quoteTokenSymbol, new Date(ctx.timestamp));
                if (!baseTokenPrice) {
                    baseTokenPrice = config.defaultBasePrice
                }
                if (!quoteTokenPrice) {
                    quoteTokenPrice = config.defaultQuotePrice
                }

                const baseBalanceAmount = balance.liquidBaseAmount + balance.lockedBaseAmount;
                const quoteBalanceAmount = balance.liquidQuoteAmount + balance.lockedQuoteAmount;

                const baseBalanceAmountBigDecimal = BigDecimal(baseBalanceAmount.toString()).div(BigDecimal(10).pow(config.baseDecimal));
                const quoteBalanceAmountBigDecimal = BigDecimal(quoteBalanceAmount.toString()).div(BigDecimal(10).pow(config.quoteDecimal));


                const lockedBaseAmount = BigDecimal(balance.lockedBaseAmount.toString()).div(BigDecimal(10).pow(config.baseDecimal));
                const lockedQuoteAmount = BigDecimal(balance.lockedQuoteAmount.toString()).div(BigDecimal(10).pow(config.quoteDecimal));

                const liquidBaseAmount = BigDecimal(balance.liquidBaseAmount.toString()).div(BigDecimal(10).pow(config.baseDecimal));
                const liquidQuoteAmount = BigDecimal(balance.liquidQuoteAmount.toString()).div(BigDecimal(10).pow(config.quoteDecimal));

                const balanceLockedTVL = lockedBaseAmount.multipliedBy(baseTokenPrice).plus(lockedQuoteAmount.multipliedBy(quoteTokenPrice));
                const balanceLiquidTVL = liquidBaseAmount.multipliedBy(baseTokenPrice).plus(liquidQuoteAmount.multipliedBy(quoteTokenPrice));

                const balanceBaseTVL = baseBalanceAmountBigDecimal.multipliedBy(baseTokenPrice);
                const balanceQuoteTVL = quoteBalanceAmountBigDecimal.multipliedBy(quoteTokenPrice);
                // const balanceTVL = balanceBaseTVL.plus(balanceQuoteTVL).toNumber();

                // balance.tvl = balanceTVL;
                // balance.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000);
                // await ctx.store.upsert(balance);

                TVL = TVL.plus(balance.tvl);
                TVLInOrders = TVLInOrders.plus(balance.tvlOrders);

                quoteTVL = quoteTVL.plus(balanceQuoteTVL);
                baseTVL = baseTVL.plus(balanceBaseTVL);

                lockedTVL = lockedTVL.plus(balanceLockedTVL);
                liquidTVL = liquidTVL.plus(balanceLiquidTVL);

                baseAmountOnContract = baseAmountOnContract.plus(baseBalanceAmountBigDecimal)
                baseAmountOnBalances = baseAmountOnBalances.plus(liquidBaseAmount)
                baseAmountOnOrders = baseAmountOnOrders.plus(lockedBaseAmount)

                ctx.meter.Gauge("total_tvl").record(TVL)
                ctx.meter.Gauge("total_orders_tvl").record(TVLInOrders)
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
