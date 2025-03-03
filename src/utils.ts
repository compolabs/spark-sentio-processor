import { Balance, Order, OrderStatus } from "./schema/store.js";
import { getPriceBySymbol } from "@sentio/sdk/utils";
import crypto from "crypto";

export const getHash = (data: string) => {
	return crypto.createHash("sha256").update(data).digest("hex");
};

export async function updateBalance(
	config: any,
	event: any,
	ctx: any,
	balance: Balance | undefined,
	balanceId: string,
	liquidBaseAmount: BigInt,
	liquidQuoteAmount: BigInt,
	lockedBaseAmount: BigInt,
	lockedQuoteAmount: BigInt,
	isSellOrderClosed?: boolean,
	isBuyOrderClosed?: boolean, 
	user?: string,
): Promise<void> {
	if (balance) {
		balance.liquidBaseAmount = BigInt(liquidBaseAmount.toString());
		balance.liquidQuoteAmount = BigInt(liquidQuoteAmount.toString());
		balance.lockedBaseAmount = BigInt(lockedBaseAmount.toString());
		balance.lockedQuoteAmount = BigInt(lockedQuoteAmount.toString());
		balance.baseAmount = BigInt(liquidBaseAmount.toString()) + BigInt(lockedBaseAmount.toString());
		balance.quoteAmount = BigInt(liquidQuoteAmount.toString()) + BigInt(lockedQuoteAmount.toString());
		balance.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000);
		isSellOrderClosed && balance.sellClosed++;
		isBuyOrderClosed && balance.buyClosed++;
		if (user && balance.sellClosed > 0 && balance.buyClosed > 0) {
			const {
				realizedPNL_24h,
				realizedPercentPNL_24h,
				realizedPNL_7d,
				realizedPercentPNL_7d,
				realizedPNL_30d,
				realizedPercentPNL_30d,
				realizedPNL_Comp1,
				realizedPercentPNL_Comp1
			} = await pnlCount(user, ctx, config);

			balance.pnl1 = realizedPNL_24h;
			balance.pnlInPersent1 = realizedPercentPNL_24h;

			balance.pnl7 = realizedPNL_7d;
			balance.pnlInPersent7 = realizedPercentPNL_7d;

			balance.pnl31 = realizedPNL_30d;
			balance.pnlInPersent31 = realizedPercentPNL_30d;
			
			balance.pnlComp1 = realizedPNL_Comp1;
			balance.pnlInPersentComp1 = realizedPercentPNL_Comp1;

			balance.pnlChangedTimestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000);
		}
		user && console.log("check pnl", user, isSellOrderClosed, isBuyOrderClosed, balance.pnl1, balance.sellClosed, balance.buyClosed)
	} else {
		balance = new Balance({
			id: balanceId,
			user: user || event.data.user.Address?.bits,
			market: config.market,
			liquidBaseAmount: BigInt(liquidBaseAmount.toString()),
			liquidQuoteAmount: BigInt(liquidQuoteAmount.toString()),
			lockedBaseAmount: BigInt(lockedBaseAmount.toString()),
			lockedQuoteAmount: BigInt(lockedQuoteAmount.toString()),
			baseAmount: BigInt(liquidBaseAmount.toString()) + BigInt(lockedBaseAmount.toString()),
			quoteAmount: BigInt(liquidQuoteAmount.toString()) + BigInt(lockedQuoteAmount.toString()),
			sellClosed: isSellOrderClosed ? 1 : 0,
			buyClosed: isBuyOrderClosed ? 1 : 0,
			timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
			initialTimestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
			pnlChangedTimestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
			pnl1: 0,
			pnl7: 0,
			pnl31: 0,
			pnlComp1: 0,
			pnlInPersent1: 0,
			pnlInPersent7: 0,
			pnlInPersent31: 0,
			pnlInPersentComp1: 0,
			tvl: 0,
		});
	}
	await ctx.store.upsert(balance);
}

export async function updateOrder(ctx: any, trade: any, order: Order): Promise<boolean> {
	const updatedAmount = BigInt(order.amount.toString()) - BigInt(trade.data.trade_size.toString());
	const isOrderClosed = updatedAmount === 0n;
	order.amount = isOrderClosed ? 0n : updatedAmount;
	order.status = isOrderClosed ? OrderStatus.Closed : order.status;
	order.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000);
	await ctx.store.upsert(order);
	return isOrderClosed;
}

export async function pnlCount(user: string, ctx: any, config: any): Promise<{
	realizedPNL_24h: number,
	realizedPercentPNL_24h: number,
	realizedPNL_7d: number,
	realizedPercentPNL_7d: number,
	realizedPNL_30d: number,
	realizedPercentPNL_30d: number,
	realizedPNL_Comp1: number
	realizedPercentPNL_Comp1: number
}> {
	const now = Math.floor(new Date(ctx.timestamp).getTime() / 1000);

	const oneDayAgo = now - 86400; 
	const sevenDaysAgo = now - 86400 * 7;
	const thirtyDaysAgo = now - 86400 * 30;
	const comp1Start = 1740992400;
	const comp1End = 1741597200;

	const userClosedOrders: Order[] = await ctx.store.list(Order, [
		{ field: 'user', op: '=', value: user },
		{ field: 'market', op: '=', value: config.market },
		{ field: 'status', op: '=', value: 'Closed' }
	]);

	const orders_24h = userClosedOrders.filter(order => order.timestamp >= oneDayAgo);
	const orders_7d = userClosedOrders.filter(order => order.timestamp >= sevenDaysAgo);
	const orders_30d = userClosedOrders.filter(order => order.timestamp >= thirtyDaysAgo);
	const orders_Comp1 = userClosedOrders.filter(order => order.timestamp >= comp1Start && order.timestamp <= comp1End);

	console.log("timestamp", now, oneDayAgo, sevenDaysAgo, thirtyDaysAgo)
	const quotePrice = Number(getPriceBySymbol(config.quoteTokenSymbol, new Date(ctx.timestamp))) || config.defaultQuotePrice;

	function calculatePNL(orders: Order[]): { realizedPNL: number, realizedPercentPNL: number } {
		if (orders.length === 0) {
			return { realizedPNL: 0, realizedPercentPNL: 0 };
		}
		const buyOrders = orders.filter(order => order.orderType === 'Buy');
		const sellOrders = orders.filter(order => order.orderType === 'Sell');

		if (buyOrders.length === 0 || sellOrders.length === 0) {
			return { realizedPNL: 0, realizedPercentPNL: 0 };
		}

		const totalBuyPrice = buyOrders.reduce((sum, order) => sum + Number(order.initialAmount) * Number(order.price) / Math.pow(10, config.priceDecimal) / Math.pow(10, config.baseDecimal), 0);
		const totalBuyAmount = buyOrders.reduce((sum, order) => sum + Number(order.initialAmount) / Math.pow(10, config.baseDecimal), 0);

		const totalSellPrice = sellOrders.reduce((sum, order) => sum + Number(order.initialAmount) * Number(order.price) / Math.pow(10, config.priceDecimal) / Math.pow(10, config.baseDecimal), 0);
		const totalSellAmount = sellOrders.reduce((sum, order) => sum + Number(order.initialAmount) / Math.pow(10, config.baseDecimal), 0);

		const averageBuyPrice = totalBuyPrice / totalBuyAmount;
		const averageSellPrice = totalSellPrice / totalSellAmount;
		const realizedPNL = (averageSellPrice - averageBuyPrice) * totalSellAmount;
		const realizedPercentPNL = ((averageSellPrice - averageBuyPrice) / averageBuyPrice) * 100;


		console.log("calculatePNL", realizedPNL, realizedPercentPNL )
		console.log("average", averageBuyPrice, averageSellPrice, totalSellAmount )
		return { realizedPNL, realizedPercentPNL };
	}

	const { realizedPNL: realizedPNL_24h, realizedPercentPNL: realizedPercentPNL_24h } = calculatePNL(orders_24h);
	const { realizedPNL: realizedPNL_7d, realizedPercentPNL: realizedPercentPNL_7d } = calculatePNL(orders_7d);
	const { realizedPNL: realizedPNL_30d, realizedPercentPNL: realizedPercentPNL_30d } = calculatePNL(orders_30d);
	const { realizedPNL: realizedPNL_Comp1, realizedPercentPNL: realizedPercentPNL_Comp1 } = calculatePNL(orders_Comp1);
	console.log("pnlCount",
		realizedPNL_24h,
		realizedPercentPNL_24h,
		realizedPNL_7d,
		realizedPercentPNL_7d,
		realizedPNL_30d,
		realizedPercentPNL_30d,
		realizedPNL_Comp1,
		realizedPercentPNL_Comp1
	)

	return {
		realizedPNL_24h,
		realizedPercentPNL_24h,
		realizedPNL_7d,
		realizedPercentPNL_7d,
		realizedPNL_30d,
		realizedPercentPNL_30d,
		realizedPNL_Comp1,
		realizedPercentPNL_Comp1
	};
}

export async function getPricesLastWeek(config: any, ctx: any): Promise<number[]> {
	const prices: number[] = [];
	const currentTimestamp = ctx.timestamp;

	const pricePromises = Array.from({ length: 7 * 24 }).map((_, i) => {
		const timestampForHourAgo = currentTimestamp - i * 3600000;
		return getPriceBySymbol(config.baseTokenSymbol, new Date(timestampForHourAgo)).then(price => {
			prices.push(price !== undefined ? price : config.defaultBasePrice);
		});
	});
	await Promise.all(pricePromises);
	console.log("prices", Math.floor(new Date(ctx.timestamp).getTime() / 1000), ctx.contractAddress, config.baseTokenSymbol, prices);
	return prices;
}

export function calculatePercentile(values: number[], ctx: any, config: any): number {
	values.sort((a, b) => a - b);
	const index = Math.floor((config.percentile / 100) * values.length);
	console.log("values", Math.floor(new Date(ctx.timestamp).getTime() / 1000), config.market, values, ctx.contractAddress )
	console.log("index", Math.floor(new Date(ctx.timestamp).getTime() / 1000), config.market, values[index], ctx.contractAddress)
	return values[index];
}



