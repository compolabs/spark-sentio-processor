import { BigDecimal } from "@sentio/sdk";
import { LogLevel } from "@sentio/sdk";
import { marketsConfig } from "./marketsConfig.js";
import { Balance } from "./schema/store.js";
import { getPriceBySymbol } from "@sentio/sdk/utils";

export async function updateBalance(
	event: any,
	eventType: "deposit" | "withdraw" | "withdrawTo" | "open" | "cancel" | "trade",
	ctx: any,
	balance: Balance | undefined,
	balanceId: string,
	liquidBaseAmount: BigInt,
	liquidQuoteAmount: BigInt,
	lockedBaseAmount: BigInt,
	lockedQuoteAmount: BigInt,
): Promise<void> {
	const marketConfig = Object.values(marketsConfig).find(market => market.market === ctx.contractAddress);

	if (!marketConfig) {
		ctx.eventLogger.emit('MarketConfigNotFound', {
			severity: LogLevel.ERROR,
			message: `Market config not found for market address ${ctx.contractAddress}`,
		});
		return;
	}

	const baseBalanceAmount = BigInt(liquidBaseAmount.toString()) + BigInt(lockedBaseAmount.toString());
	const quoteBalanceAmount = BigInt(liquidQuoteAmount.toString()) + BigInt(lockedQuoteAmount.toString());

	const baseBalanceAmountBigDecimal = BigDecimal(baseBalanceAmount.toString()).div(BigDecimal(10).pow(marketConfig.baseDecimal));
	const quoteBalanceAmountBigDecimal = BigDecimal(quoteBalanceAmount.toString()).div(BigDecimal(10).pow(marketConfig.quoteDecimal));

	if (balance) {
		balance.liquidBaseAmount = BigInt(liquidBaseAmount.toString());
		balance.liquidQuoteAmount = BigInt(liquidQuoteAmount.toString());
		balance.lockedBaseAmount = BigInt(lockedBaseAmount.toString());
		balance.lockedQuoteAmount = BigInt(lockedQuoteAmount.toString());
		balance.timestamp = Math.floor(new Date(ctx.timestamp).getTime() / 1000);
		balance.baseDecimalAmount = baseBalanceAmountBigDecimal.toNumber();
		balance.quoteDecimalAmount = quoteBalanceAmountBigDecimal.toNumber();
		balance.txCount++;
		if (eventType === 'deposit') {
			balance.depositCount++;
		} else if (eventType === 'withdraw') {
			balance.withdrawCount++;
		} else if (eventType === 'open') {
			balance.openOrderCount++;
		} else if (eventType === 'cancel') {
			balance.cancelOrderCount++;
		} else if (eventType === 'trade') {
			balance.tradeCount++;
		}

	} else {
		balance = new Balance({
			id: balanceId,
			user: event.data.user.Address?.bits,
			market: ctx.contractAddress,
			liquidBaseAmount: BigInt(liquidBaseAmount.toString()),
			liquidQuoteAmount: BigInt(liquidQuoteAmount.toString()),
			lockedBaseAmount: BigInt(lockedBaseAmount.toString()),
			lockedQuoteAmount: BigInt(lockedQuoteAmount.toString()),
			baseDecimalAmount: 0,
			quoteDecimalAmount: 0,
			tvl: 0,
			txCount: 1,
			depositCount: eventType === 'deposit' ? 1 : 0,
			withdrawCount: eventType === 'withdraw' ? 1 : 0,
			openOrderCount: eventType === 'open' ? 1 : 0,
			cancelOrderCount: eventType === 'cancel' ? 1 : 0,
			tradeCount: eventType === 'trade' ? 1 : 0,
			timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000)
		});
	}

	await ctx.store.upsert(balance);
}

export async function getPricesLastWeek(symbol: string, ctx: any): Promise<number[]> {
	const prices: number[] = [];
	const currentTimestamp = ctx.timestamp;

	for (let i = 0; i < 7 * 24; i++) {
		const timestampForHourAgo = currentTimestamp - i * 3600000;
		const price = await getPriceBySymbol(symbol, new Date(timestampForHourAgo));
		// console.log("price", price, new Date(timestampForHourAgo), timestampForHourAgo);
		if (price !== undefined) {
			prices.push(price);
		}
	}
	console.log("prices",prices, ctx.contractAddress)
	return prices;
}

export function calculatePercentile(values: number[], percentile: number, ctx: any): number {
	values.sort((a, b) => a - b);
	const index = Math.floor((percentile / 100) * values.length);
	console.log("values", values, ctx.contractAddress)
	console.log("index", values[index], values.length, ctx.contractAddress)
	return values[index];
}
