import { BN } from "fuels";
import { SparkMarketProcessor } from "./types/fuel/SparkMarketProcessor.js";
import { FuelNetwork } from "@sentio/sdk/fuel";

interface UserScoreSnapshot {
    timestamp: string;          
    chain_id: number;           
    block_number: number;      
    user: string;
    market_address: string;
    total_value_locked_score: number;
}

interface UserTradeData {
    user: string;
    total_trading_volume: number;
    last_trade_timestamp: string;
}

interface UserOpenOrderData {
    user: string;
    total_order_value: number;
    last_order_timestamp: string;
}

interface UserBalance {
    user: string;
    liquid_base_balance: BN;
    liquid_quote_balance: BN;
    locked_base_balance: BN;
    locked_quote_balance: BN;
}
const userBalanceData: Record<string, UserBalance> = {};

// const userTradeData: Record<string, UserTradeData> = {};
// const userOrderData: Record<string, UserOpenOrderData> = {};

SparkMarketProcessor.bind({
    chainId: FuelNetwork.TEST_NET,
    address: '0xafb6691ff311bb66067486481d7400d01faeef2f291fcfdda514e82d7230d027'
})
.onLogDepositEvent(async (event, ctx) => {
        const user = event.data.user.Address?.bits as string;
        const liquidBase = event.data.balance.liquid.base; 
        const liquidQuote = event.data.balance.liquid.quote; 
        const lockedBase = event.data.balance.locked.base; 
        const lockedQuote = event.data.balance.locked.quote;

            if (userBalanceData[user]) {
                userBalanceData[user].liquid_base_balance = liquidBase;
                userBalanceData[user].liquid_quote_balance = liquidQuote;
                userBalanceData[user].locked_base_balance = lockedBase;
                userBalanceData[user].locked_quote_balance = lockedQuote;
  
            } else {
                userBalanceData[user] = {
                    user: user,
                    liquid_base_balance: liquidBase,
                    liquid_quote_balance: liquidQuote,
                    locked_base_balance: lockedBase,
                    locked_quote_balance: lockedQuote
                };
        }
    })
    
    .onLogWithdrawEvent(async (event, ctx) => {
        const user = event.data.user.Address?.bits as string;
        const liquidBase = event.data.balance.liquid.base;
        const liquidQuote = event.data.balance.liquid.quote;
        const lockedBase = event.data.balance.locked.base;
        const lockedQuote = event.data.balance.locked.quote;

            userBalanceData[user].liquid_base_balance = liquidBase;
            userBalanceData[user].liquid_quote_balance = liquidQuote;
            userBalanceData[user].locked_base_balance = lockedBase;
            userBalanceData[user].locked_quote_balance = lockedQuote;
    })
    
    .onLogOpenOrderEvent(async (event, ctx) => {
        const user = event.data.user.Address?.bits as string;
        const liquidBase = event.data.balance.liquid.base;
        const liquidQuote = event.data.balance.liquid.quote;
        const lockedBase = event.data.balance.locked.base;
        const lockedQuote = event.data.balance.locked.quote;

        userBalanceData[user].liquid_base_balance = liquidBase;
        userBalanceData[user].liquid_quote_balance = liquidQuote;
        userBalanceData[user].locked_base_balance = lockedBase;
        userBalanceData[user].locked_quote_balance = lockedQuote;
    })

    .onLogCancelOrderEvent(async (event, ctx) => {
        const user = event.data.user.Address?.bits as string;
        const liquidBase = event.data.balance.liquid.base;
        const liquidQuote = event.data.balance.liquid.quote;
        const lockedBase = event.data.balance.locked.base;
        const lockedQuote = event.data.balance.locked.quote;

        userBalanceData[user].liquid_base_balance = liquidBase;
        userBalanceData[user].liquid_quote_balance = liquidQuote;
        userBalanceData[user].locked_base_balance = lockedBase;
        userBalanceData[user].locked_quote_balance = lockedQuote;
    })

    .onLogTradeOrderEvent(async (event, ctx) => {

        const seller = event.data.order_seller.Address?.bits as string;
        const buyer = event.data.order_buyer.Address?.bits as string;

        const seller_liquidBase = event.data.s_balance.liquid.base;
        const seller_liquidQuote = event.data.s_balance.liquid.quote;
        const seller_lockedBase = event.data.s_balance.locked.base;
        const seller_lockedQuote = event.data.s_balance.locked.quote;

        const buyer_liquidBase = event.data.b_balance.liquid.base;
        const buyer_liquidQuote = event.data.b_balance.liquid.quote;
        const buyer_lockedBase = event.data.b_balance.locked.base;
        const buyer_lockedQuote = event.data.b_balance.locked.quote;

        userBalanceData[seller].liquid_base_balance = seller_liquidBase;
        userBalanceData[seller].liquid_quote_balance = seller_liquidQuote;
        userBalanceData[seller].locked_base_balance = seller_lockedBase;
        userBalanceData[seller].locked_quote_balance = seller_lockedQuote;

        userBalanceData[buyer].liquid_base_balance = buyer_liquidBase;
        userBalanceData[buyer].liquid_quote_balance = buyer_liquidQuote;
        userBalanceData[buyer].locked_base_balance = buyer_lockedBase;
        userBalanceData[buyer].locked_quote_balance = buyer_lockedQuote;
    })
   

