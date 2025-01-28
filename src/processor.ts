import { SparkMarketProcessor } from "./types/fuel/SparkMarketProcessor.js";
import { FuelNetwork } from "@sentio/sdk/fuel";
import { BigDecimal, Counter } from "@sentio/sdk";
import { marketsConfig } from './marketsConfig.js';
import { Balance, DailyMarketVolume, DailyVolume, Order, OrderStatus, OrderType, Pools, TotalMarketVolume, TotalVolume, TradeEvent, UserScoreSnapshot } from './schema/store.js';
import { getPriceBySymbol } from "@sentio/sdk/utils";
import { nanoid } from "nanoid";
import { calculatePercentile, getHash, getPricesLastWeek, updateBalance, updateBalanceTrade } from "./utils.js";
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

        const balanceId = getHash(`${deposit.data.user.Address?.bits}-${config.market}`);
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
            
        const balanceId = getHash(`${withdraw.data.user.Address?.bits}-${config.market}`);
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
            
        const balanceId = getHash(`${withdrawTo.data.user.Address?.bits}-${config.market}`);    
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
        
        const balanceId = getHash(`${open.data.user.Address?.bits}-${config.market}`);
        let balance = await ctx.store.get(Balance, balanceId);

        const liquidBaseAmount = BigInt(open.data.balance.liquid.base.toString());
        const liquidQuoteAmount = BigInt(open.data.balance.liquid.quote.toString());
        const lockedBaseAmount = BigInt(open.data.balance.locked.base.toString());
        const lockedQuoteAmount = BigInt(open.data.balance.locked.quote.toString());
        await updateBalance(config, open, ctx, balance, balanceId, liquidBaseAmount, liquidQuoteAmount, lockedBaseAmount, lockedQuoteAmount);
            
        const order = new Order({
            id: open.data.order_id,
            market: config.market,
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
        console.log("open order", open.data.order_id, config.market, ctx.contractAddress, order);
    })
    .onLogTradeOrderEvent(async (trade, ctx: any) => {
        tradeOrderCounter.add(ctx, 1);
        totalEventsCounter.add(ctx, 1);
            
        const seller_liquidBaseAmount = BigInt(trade.data.s_balance.liquid.base.toString());
        const seller_liquidQuoteAmount = BigInt(trade.data.s_balance.liquid.quote.toString());
        const seller_lockedBaseAmount = BigInt(trade.data.s_balance.locked.base.toString());
        const seller_lockedQuoteAmount = BigInt(trade.data.s_balance.locked.quote.toString());
        const seller = trade.data.order_seller.Address?.bits;
            
        const buyer_liquidBaseAmount = BigInt(trade.data.b_balance.liquid.base.toString());
        const buyer_liquidQuoteAmount = BigInt(trade.data.b_balance.liquid.quote.toString());
        const buyer_lockedBaseAmount = BigInt(trade.data.b_balance.locked.base.toString());
        const buyer_lockedQuoteAmount = BigInt(trade.data.b_balance.locked.quote.toString());
        const buyer = trade.data.order_buyer.Address?.bits;
            
        const seller_balanceId = getHash(`${trade.data.order_seller.Address?.bits}-${config.market}`);
        const buyer_balanceId = getHash(`${trade.data.order_buyer.Address?.bits}-${config.market}`);

        const [seller_balance, buyer_balance, sell_order, buy_order] = await Promise.all([
            ctx.store.get(Balance, seller_balanceId),
            ctx.store.get(Balance, buyer_balanceId),
            ctx.store.get(Order, trade.data.base_sell_order_id),
            ctx.store.get(Order, trade.data.base_buy_order_id),
        ]);
            
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
            console.log("no sell order for trade", trade.data.base_sell_order_id);
            ctx.eventLogger.emit("no sell order for trade", {
                market: ctx.contractAddress,
                config: config.market,
                orderId: trade.data.base_sell_order_id,
            })
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
            console.log("no buy order for trade", trade.data.base_buy_order_id);
            ctx.eventLogger.emit("no buy order for trade", {
            market: ctx.contractAddress,
            config: config.market,
            orderId: trade.data.base_buy_order_id})
        }
            
        await updateBalanceTrade(config, ctx, seller, seller_balance, seller_balanceId, seller_liquidBaseAmount, seller_liquidQuoteAmount, seller_lockedBaseAmount, seller_lockedQuoteAmount);
        await updateBalanceTrade(config, ctx, buyer, buyer_balance, buyer_balanceId, buyer_liquidBaseAmount, buyer_liquidQuoteAmount, buyer_lockedBaseAmount, buyer_lockedQuoteAmount);
            
        const eventVolume = BigDecimal(trade.data.trade_price.toString()).div(BigDecimal(10).pow(config.priceDecimal)).multipliedBy(BigDecimal(trade.data.trade_size.toString()).div(BigDecimal(10).pow(config.baseDecimal)));
        const tradeEvent = new TradeEvent({
            id: nanoid(),
            market: config.market,
            timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
            price: parseFloat(BigDecimal(trade.data.trade_price.toString()).div(BigDecimal(10).pow(config.priceDecimal)).toString()),
            amount: parseFloat(BigDecimal(trade.data.trade_size.toString()).div(BigDecimal(10).pow(config.baseDecimal)).toString()),
            volume: eventVolume.toNumber(),
            seller: trade.data.order_seller.Address?.bits as string,
            buyer: trade.data.order_buyer.Address?.bits as string,
            date: new Date(ctx.timestamp).toISOString().slice(0, 19).replace('T', ' '),
        });
        await ctx.store.upsert(tradeEvent);
    })
    .onLogCancelOrderEvent(async (cancel, ctx: any) => {
        cancelOrderCounter.add(ctx, 1);
        totalEventsCounter.add(ctx, 1);

        const balanceId = getHash(`${cancel.data.user.Address?.bits}-${config.market}`);
        const [balance, order] = await Promise.all([ctx.store.get(Balance, balanceId), ctx.store.get(Order, cancel.data.order_id)]);

        if (order) {
            order.amount = 0n
            order.status = OrderStatus.Canceled
            order.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
            await ctx.store.upsert(order)
        } else {
            console.log("no order fo cancel", cancel.data.order_id);
            ctx.eventLogger.emit("no order for cancel", {
            market: ctx.contractAddress,
            config: config.market,
            orderId: cancel.data.order_id})
        }

        const liquidBaseAmount = BigInt(cancel.data.balance.liquid.base.toString());
        const liquidQuoteAmount = BigInt(cancel.data.balance.liquid.quote.toString());
        const lockedBaseAmount = BigInt(cancel.data.balance.locked.base.toString());
        const lockedQuoteAmount = BigInt(cancel.data.balance.locked.quote.toString());
        await updateBalance(config, cancel, ctx, balance, balanceId, liquidBaseAmount, liquidQuoteAmount, lockedBaseAmount, lockedQuoteAmount);
    })
    .onTimeInterval(async (block, ctx) => {
        const baseTokenPrice = await getPriceBySymbol(config.baseTokenSymbol, new Date(ctx.timestamp)) || config.defaultBasePrice;

        const marketActiveOrders = await ctx.store.list(Order, [
            { field: 'market', op: '=', value: config.market },
            { field: 'status', op: '=', value: 'Active' }
        ]);

        const buyOrders = marketActiveOrders.filter(order => order.orderType === 'Buy');
        const sellOrders = marketActiveOrders.filter(order => order.orderType === 'Sell');

        const highestBid = Number(buyOrders.reduce((max, order) => order.price > max ? order.price : max, -Infinity)) / Math.pow(10, Number(config.priceDecimal));
        const lowestAsk = Number(sellOrders.reduce((min, order) => order.price < min ? order.price : min, Infinity)) / Math.pow(10, Number(config.priceDecimal));

        const midpointPrice = (highestBid + lowestAsk)/2
        console.log("midpointPrice", midpointPrice, highestBid, lowestAsk, config.market)

        const historicalBasePrices = await getPricesLastWeek(config, ctx);
        console.log("historicalBasePrices", Math.floor(new Date(ctx.timestamp).getTime() / 1000), config.market, historicalBasePrices, ctx.contractAddress);

        const basePriceChanges = historicalBasePrices.map((price, index, arr) => {
            if (index === 0) return 0;
            return Math.abs((arr[index] - arr[index - 1]) / arr[index - 1])
        });
        console.log("Base price changes", Math.floor(new Date(ctx.timestamp).getTime() / 1000), config.market, basePriceChanges,  ctx.contractAddress);

        const percentile = calculatePercentile(basePriceChanges, ctx, config);

        const lowerLimit = midpointPrice * (1 - percentile);
        const upperLimit = midpointPrice * (1 + percentile);
        console.log("limits", Math.floor(new Date(ctx.timestamp).getTime() / 1000), config.market, baseTokenPrice, percentile, lowerLimit, upperLimit, ctx.contractAddress);

        const userOrdersMap = marketActiveOrders.reduce((map: Record<string, Order[]>, order) => {
            if (!map[order.user]) {
                map[order.user] = [];
            }
            map[order.user].push(order);
            return map;
        }, {});

        const snapshots = Object.entries(userOrdersMap).map(([user, userOrders]) => {
            const userUsefulTVL = userOrders.reduce((total, userOrder) => {
                const orderPrice = Number(userOrder.price) / Math.pow(10, Number(config.priceDecimal));
                if (orderPrice >= lowerLimit && orderPrice <= upperLimit) {
                    return total + (Number(userOrder.amount) / Math.pow(10, Number(config.baseDecimal))) * Number(baseTokenPrice);
                }
                return total;
            }, 0);

            if (userUsefulTVL > 0) {
                const snapshot = new UserScoreSnapshot({
                    id: nanoid(),
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
                    block_date: new Date(ctx.timestamp).toISOString().slice(0, 19).replace('T', ' '),
                    chain_id: config.chainId,
                    block_number: Number(block.height),
                    user_address: user,
                    pool_address: config.market,
                    total_value_locked_score: userUsefulTVL,
                    market_depth_score: undefined,
                    marketPrice: baseTokenPrice,
                    midpointPrice: midpointPrice,
                    lowerLimit: lowerLimit,
                    upperLimit: upperLimit,
                    percentile: percentile,
                });
                
                return ctx.store.upsert(snapshot).then(() => {
                    console.log("snapshot", snapshot.pool_address, config.market);
                });
            } else {
                console.log("no useful", ctx.contractAddress, config.market, user);
                return Promise.resolve();
            }
        });
        await Promise.all(snapshots);

        const baseToken = new Pools({
            id: getHash(`${config.baseToken}-${config.market}`),
            chain_id: config.chainId,
            creation_block_number: config.creationBlockNumber,
            timestamp: config.contractDeployed,
            pool_address: config.market,
            lp_token_address: config.market,
            lp_token_symbol: `${config.baseTokenSymbol}/${config.quoteTokenSymbol}`,
            token_address: config.baseToken,
            token_symbol: config.baseTokenSymbol,
            token_decimals: config.baseDecimal,
            token_index: 1,
            fee_rate: config.feeRate,
            dex_type: config.dexType,
        });
        await ctx.store.upsert(baseToken);
        const quoteToken = new Pools({
            id: getHash(`${config.quoteToken}-${config.market}`),
            chain_id: config.chainId,
            creation_block_number: config.creationBlockNumber,
            timestamp: config.contractDeployed,
            pool_address: config.market,
            lp_token_address: config.market,
            lp_token_symbol: `${config.baseTokenSymbol}/${config.quoteTokenSymbol}`,
            token_address: config.quoteToken,
            token_symbol: config.quoteTokenSymbol,
            token_decimals: config.quoteDecimal,
            token_index: 0,
            fee_rate: config.feeRate,
            dex_type: config.dexType,
        });
        await ctx.store.upsert(quoteToken);
    }, 60, 60)
    .onTimeInterval(async (block, ctx) => {
        const marketBalances = await ctx.store.list(Balance, [{ field: 'market', op: '=', value: config.market }]);

        let TVL = BigDecimal(0);
        let amountBase = BigDecimal(0);
        let amountQuote = BigDecimal(0);
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
        const marketTrades = protocolTrades.filter(trade => trade.market === config.market);

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
            market: config.market,
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
            market: config.market,
            timestamp: currentTimestamp,
            volume: totalMarketTradeVolume.toNumber(),
        });

        await ctx.store.upsert(totalVolume);
        await ctx.store.upsert(totalMarketVolume);
        await ctx.store.upsert(dailyVolume);
        await ctx.store.upsert(dailyMarketVolume);

        const [baseTokenPrice = config.defaultBasePrice, quoteTokenPrice = config.defaultQuotePrice] = await Promise.all([
            getPriceBySymbol(config.baseTokenSymbol, new Date(ctx.timestamp)),
            getPriceBySymbol(config.quoteTokenSymbol, new Date(ctx.timestamp)),
        ]);

        for (const balance of marketBalances) {

            const baseBalanceAmountBigDecimal = BigDecimal(balance.baseAmount.toString()).div(BigDecimal(10).pow(config.baseDecimal));
            const quoteBalanceAmountBigDecimal = BigDecimal(balance.quoteAmount.toString()).div(BigDecimal(10).pow(config.quoteDecimal));

            const lockedBaseAmount = BigDecimal(balance.lockedBaseAmount.toString()).div(BigDecimal(10).pow(config.baseDecimal));
            const lockedQuoteAmount = BigDecimal(balance.lockedQuoteAmount.toString()).div(BigDecimal(10).pow(config.quoteDecimal));

            const liquidBaseAmount = BigDecimal(balance.liquidBaseAmount.toString()).div(BigDecimal(10).pow(config.baseDecimal));
            const liquidQuoteAmount = BigDecimal(balance.liquidQuoteAmount.toString()).div(BigDecimal(10).pow(config.quoteDecimal));

            const balanceLockedTVL = lockedBaseAmount.multipliedBy(baseTokenPrice).plus(lockedQuoteAmount.multipliedBy(quoteTokenPrice));
            const balanceLiquidTVL = liquidBaseAmount.multipliedBy(baseTokenPrice).plus(liquidQuoteAmount.multipliedBy(quoteTokenPrice));

            const balanceBaseTVL = baseBalanceAmountBigDecimal.multipliedBy(baseTokenPrice);
            const balanceQuoteTVL = quoteBalanceAmountBigDecimal.multipliedBy(quoteTokenPrice);
            const balanceTVL = balanceBaseTVL.plus(balanceQuoteTVL).toNumber();

            TVL = TVL.plus(balanceTVL);
            amountBase = amountBase.plus(baseBalanceAmountBigDecimal);
            amountQuote = amountQuote.plus(quoteBalanceAmountBigDecimal);

            quoteTVL = quoteTVL.plus(balanceQuoteTVL);
            baseTVL = baseTVL.plus(balanceBaseTVL);

            lockedTVL = lockedTVL.plus(balanceLockedTVL);
            liquidTVL = liquidTVL.plus(balanceLiquidTVL);

            baseAmountOnContract = baseAmountOnContract.plus(baseBalanceAmountBigDecimal)
            baseAmountOnBalances = baseAmountOnBalances.plus(liquidBaseAmount)
            baseAmountOnOrders = baseAmountOnOrders.plus(lockedBaseAmount)

            ctx.meter.Gauge("total_tvl").record(TVL)
            ctx.meter.Gauge("amount_base").record(amountBase)
            ctx.meter.Gauge("amount_quote").record(amountQuote)

            ctx.meter.Gauge("total_orders_tvl").record(TVLInOrders)
            ctx.meter.Gauge("total_quote_tvl").record(quoteTVL)
            ctx.meter.Gauge("total_base_tvl").record(baseTVL)
            ctx.meter.Gauge("total_locked_tvl").record(lockedTVL)
            ctx.meter.Gauge("total_liquid_tvl").record(liquidTVL)

            ctx.meter.Gauge("base_amount_on_contract").record(baseAmountOnContract)
            ctx.meter.Gauge("base_amount_on_balances").record(baseAmountOnBalances)
            ctx.meter.Gauge("base_amount_on_orders").record(baseAmountOnOrders)
        }
    }, 5, 5)
})
