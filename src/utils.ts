import { BigDecimal } from "@sentio/sdk";
// import { marketsConfig } from "./marketsConfig.js";
import { Balance } from "./schema/store.js";
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
): Promise<void> {
	// let baseTokenPrice = await getPriceBySymbol(config.baseTokenSymbol, new Date(ctx.timestamp)) || config.defaultBasePrice;
	// let quoteTokenPrice = await getPriceBySymbol(config.quoteTokenSymbol, new Date(ctx.timestamp)) || config.defaultQuotePrice;

	// const baseBalanceAmount = BigInt(liquidBaseAmount.toString()) + BigInt(lockedBaseAmount.toString());
	// const quoteBalanceAmount = BigInt(liquidQuoteAmount.toString()) + BigInt(lockedQuoteAmount.toString());

	// const baseInOrders = BigInt(lockedBaseAmount.toString());
	// const quoteInOrders = BigInt(lockedQuoteAmount.toString());

	// const baseBalanceAmountBigDecimal = BigDecimal(baseBalanceAmount.toString()).div(BigDecimal(10).pow(config.baseDecimal));
	// const quoteBalanceAmountBigDecimal = BigDecimal(quoteBalanceAmount.toString()).div(BigDecimal(10).pow(config.quoteDecimal));

	// const baseInOrdersBigDecimal = BigDecimal(baseInOrders.toString()).div(BigDecimal(10).pow(config.baseDecimal));
	// const quoteInOrdersBigDecimal = BigDecimal(quoteInOrders.toString()).div(BigDecimal(10).pow(config.quoteDecimal));

	// const balanceBaseTVL = baseBalanceAmountBigDecimal.multipliedBy(baseTokenPrice);
	// const balanceQuoteTVL = quoteBalanceAmountBigDecimal.multipliedBy(quoteTokenPrice);

	// const balanceBaseOrdersTVL = baseInOrdersBigDecimal.multipliedBy(baseTokenPrice);
	// const balanceQuoteOrdersTVL = quoteInOrdersBigDecimal.multipliedBy(quoteTokenPrice);

	// const balanceTVL = balanceBaseTVL.plus(balanceQuoteTVL).toNumber();
	// const balanceOrdersTVL = balanceBaseOrdersTVL.plus(balanceQuoteOrdersTVL).toNumber();

	if (balance) {
		balance.liquidBaseAmount = BigInt(liquidBaseAmount.toString())
		balance.liquidQuoteAmount = BigInt(liquidQuoteAmount.toString())
		balance.lockedBaseAmount = BigInt(lockedBaseAmount.toString())
		balance.lockedQuoteAmount = BigInt(lockedQuoteAmount.toString())
		balance.baseAmount = BigInt(liquidBaseAmount.toString()) + BigInt(lockedBaseAmount.toString())
		balance.quoteAmount = BigInt(liquidQuoteAmount.toString()) + BigInt(lockedQuoteAmount.toString())
		balance.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000)
	} else {
		balance = new Balance({
			id: balanceId,
			user: event.data.user.Address?.bits,
			market: config.market,
			liquidBaseAmount: BigInt(liquidBaseAmount.toString()),
			liquidQuoteAmount: BigInt(liquidQuoteAmount.toString()),
			lockedBaseAmount: BigInt(lockedBaseAmount.toString()),
			lockedQuoteAmount: BigInt(lockedQuoteAmount.toString()),
			baseAmount: BigInt(liquidBaseAmount.toString()) + BigInt(lockedBaseAmount.toString()),
			quoteAmount: BigInt(liquidQuoteAmount.toString()) + BigInt(lockedQuoteAmount.toString()),
			timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000)
		});
	}
	await ctx.store.upsert(balance);
}

export async function getPricesLastWeek(config: any, ctx: any): Promise<number[]> {
	const prices: number[] = [];
	const currentTimestamp = ctx.timestamp;

	const pricePromises = Array.from({ length: 7 * 24 }).map((_, i) => {
		const timestampForHourAgo = currentTimestamp - i * 3600000;
		return getPriceBySymbol(config.baseTokenSymbol, new Date(timestampForHourAgo)).then(price => {
			price !== undefined ? prices.push(price) : null;
		});
	});
	await Promise.all(pricePromises);
	console.log("prices", prices, ctx.contractAddress, config.baseTokenSymbol);
	return prices;
}


export function calculatePercentile(values: number[], percentile: number, ctx: any, config: any): number {
	values.sort((a, b) => a - b);
	const index = Math.floor((percentile / 100) * values.length);
	console.log("values", values, ctx.contractAddress, config.market)
	console.log("index", values[index], ctx.contractAddress, config.market)
	return values[index];
}
