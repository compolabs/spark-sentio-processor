import { SparkMarketProcessor } from "./types/fuel/SparkMarketProcessor.js";
import { FuelNetwork } from "@sentio/sdk/fuel";
import { BigDecimal, LogLevel } from "@sentio/sdk";
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

MARKETS.forEach((market) => {
    SparkMarketProcessor.bind({
        address: market,
        chainId: FuelNetwork.MAIN_NET
    })
        .onLogDepositEvent(async (deposit, ctx) => {

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

                await ctx.store.upsert(balance);
            } else {
                ctx.eventLogger.emit('BALANCE WITHDRAW', {
                    severity: LogLevel.ERROR,
                    user: withdraw.data.user.Address?.bits,
                    balance: balanceId,
                    reason: 'No balance for user',
                });
            }

        })
        .onLogWithdrawToMarketEvent(async (withdrawTo, ctx) => {

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

                await ctx.store.upsert(balance);
            } else {
                ctx.eventLogger.emit('BALANCE WITHDRAW_TO', {
                    severity: LogLevel.ERROR,
                    user: withdrawTo.data.user.Address?.bits,
                    balance: balanceId,
                    reason: 'No balance for user',
                });
            }

        })

        .onLogOpenOrderEvent(async (open, ctx: any) => {

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

                await ctx.store.upsert(balance);
            } else {
                ctx.eventLogger.emit('BALANCE OPEN', {
                    severity: LogLevel.ERROR,
                    user: open.data.user.Address?.bits,
                    balance: balanceId,
                    reason: 'No balance for user',
                });
            }

        })
        .onLogCancelOrderEvent(async (cancel, ctx: any) => {

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

                await ctx.store.upsert(balance);
            } else {
                ctx.eventLogger.emit('BALANCE CANCEL', {
                    severity: LogLevel.ERROR,
                    user: cancel.data.user.Address?.bits,
                    balance: balanceId,
                    reason: 'No balance for user',
                });
            }

        })
        .onLogTradeOrderEvent(async (trade, ctx: any) => {

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

                await ctx.store.upsert(seller_balance);
            } else {
                ctx.eventLogger.emit('BALANCE TRADE', {
                    severity: LogLevel.ERROR,
                    user: trade.data.order_seller.Address?.bits,
                    balance: seller_balanceId,
                    reason: 'No balance for seller',
                });
            }

            if (buyer_balance) {
                buyer_balance.liquidBaseAmount = buyer_liquidBaseAmount,
                    buyer_balance.liquidQuoteAmount = buyer_liquidQuoteAmount,
                    buyer_balance.lockedBaseAmount = buyer_lockedBaseAmount,
                    buyer_balance.lockedQuoteAmount = buyer_lockedQuoteAmount

                await ctx.store.upsert(buyer_balance);
            } else {
                ctx.eventLogger.emit('BALANCE TRADE', {
                    severity: LogLevel.ERROR,
                    user: trade.data.order_buyer.Address?.bits,
                    balance: buyer_balanceId,
                    reason: 'No balance for buyer',
                });
            }
        })
        .onTimeInterval(async (block, ctx) => {
            const balances = await ctx.store.list(Balance, []);
            const filteredBalances = balances.filter(balance => balance.market === ctx.contractAddress);

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
                    ctx.eventLogger.emit('BaseTokenPriceError', {
                        severity: LogLevel.ERROR,
                        message: `Failed to load base token price for ${marketConfig.baseToken}. Using default price: ${marketConfig.defaultBasePrice}`,
                        token: marketConfig.baseTokenSymbol,
                        defaultPrice: marketConfig.defaultBasePrice.toString(),
                    });
                }

                if (!quoteTokenPrice) {
                    quoteTokenPrice = marketConfig.defaultQuotePrice;
                    ctx.eventLogger.emit('QuoteTokenPriceError', {
                        severity: LogLevel.ERROR,
                        message: `Failed to load quote token price for ${marketConfig.quoteToken}. Using default price: ${marketConfig.defaultQuotePrice}`,
                        token: marketConfig.quoteTokenSymbol,
                        defaultPrice: marketConfig.defaultQuotePrice.toString(),
                    });
                }

                const baseTVL = balance.liquidBaseAmount + balance.lockedBaseAmount;
                const quoteTVL = balance.liquidQuoteAmount + balance.lockedQuoteAmount;

                const baseTVLBigDecimal = BigDecimal(baseTVL.toString()).div(BigDecimal(10).pow(marketConfig.baseDecimal));
                const quoteTVLBigDecimal = BigDecimal(quoteTVL.toString()).div(BigDecimal(10).pow(marketConfig.quoteDecimal));

                const totalBaseTVL = baseTVLBigDecimal.multipliedBy(baseTokenPrice);
                const totalQuoteTVL = quoteTVLBigDecimal.multipliedBy(quoteTokenPrice);

                const tvl = totalBaseTVL.plus(totalQuoteTVL).toString();

                const snapshotId = getHash(`${balance.user}-${ctx.contractAddress}-${ctx.transaction}`);
                const snapshot = new UserScoreSnapshot({
                    id: snapshotId,
                    timestamp: Math.floor(new Date(ctx.timestamp).getTime() / 1000),
                    block_date: new Date(ctx.timestamp).toISOString().slice(0, 19).replace('T', ' '),
                    chain_id: Number(ctx.chainId),
                    block_number: Number(block.height),
                    user_address: balance.user,
                    pool_address: ctx.contractAddress,
                    total_value_locked_score: Number(tvl),
                    market_depth_score: undefined
                });

                await ctx.store.upsert(snapshot);

                ctx.eventLogger.emit('Snapshot', {
                    message: `Snapshot for user ${balance.user}: ${new Date().toISOString()}`,
                    severity: LogLevel.INFO,
                    market: marketConfig.name,
                    timestamp: new Date().toISOString(),
                    block_date: ctx.timestamp.toString(),
                    block_number: block.height.toString(),
                    user_address: balance.user,
                    pool_address: ctx.contractAddress,
                    total_value_locked_score: tvl,
                    baseTokenPrice: baseTokenPrice.toString(),
                    quoteTokenPrice: quoteTokenPrice.toString()
                });

            }
        }, 60);
})
