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
			const { realizedPNL, realizedPercentPNL } = await pnlCount(user, ctx, config);
			balance.pnl = realizedPNL;
			balance.pnlInPersent = realizedPercentPNL;
			balance.pnlChangedTimestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
		}
		user && console.log("check pnl", user, isSellOrderClosed, isBuyOrderClosed, balance.pnl, balance.sellClosed, balance.buyClosed)
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
			pnl: 0,
			pnlInPersent: 0,
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

export async function pnlCount(user: string, ctx: any, config: any): Promise<{ realizedPNL: number, realizedPercentPNL: number }> {
	const userClosedOrders: Order[] = await ctx.store.list(Order, [
		{ field: 'user', op: '=', value: user },
		{ field: 'market', op: '=', value: config.market },
		{ field: 'status', op: '=', value: 'Closed' }
	]);

	const buyOrders = userClosedOrders.filter(order => order.orderType === 'Buy');
	const sellOrders = userClosedOrders.filter(order => order.orderType === 'Sell');

	const totalBuyPrice = buyOrders.reduce((sum, order) => sum + Number(order.initialAmount) * Number(order.price) * Math.pow(10, config.priceDecimal), 0);
	const totalBuyAmount = buyOrders.reduce((sum, order) => sum + Number(order.initialAmount), 0);

	const totalSellPrice = sellOrders.reduce((sum, order) => sum + Number(order.initialAmount) * Number(order.price) * Math.pow(10, config.priceDecimal), 0);
	const totalSellAmount = sellOrders.reduce((sum, order) => sum + Number(order.initialAmount), 0);

	const averageBuyPrice = totalBuyPrice / totalBuyAmount;
	const averageSellPrice = totalSellPrice / totalSellAmount;

	const realizedPNL = (averageSellPrice - averageBuyPrice) * totalSellAmount
	const realizedPercentPNL = (averageSellPrice - averageBuyPrice) / averageBuyPrice * 100

	return { realizedPNL, realizedPercentPNL };
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



