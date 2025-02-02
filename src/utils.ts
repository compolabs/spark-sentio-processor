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
	user?: string
): Promise<void> {
	if (balance) {
		balance.liquidBaseAmount = BigInt(liquidBaseAmount.toString());
		balance.liquidQuoteAmount = BigInt(liquidQuoteAmount.toString());
		balance.lockedBaseAmount = BigInt(lockedBaseAmount.toString());
		balance.lockedQuoteAmount = BigInt(lockedQuoteAmount.toString());
		balance.baseAmount = BigInt(liquidBaseAmount.toString()) + BigInt(lockedBaseAmount.toString());
		balance.quoteAmount = BigInt(liquidQuoteAmount.toString()) + BigInt(lockedQuoteAmount.toString());
		balance.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000);
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
			timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
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
