import { SparkMarketProcessor } from "./types/fuel/SparkMarketProcessor.js";
import { FuelNetwork } from "@sentio/sdk/fuel";

/*
DepositEvent
OpenOrderEvent
CancelOrderEvent
TradeOrderEvent
WithdrawEvent
SetEpochEvent
SetProtocolFeeEvent
SetMatcherRewardEvent
*/

SparkMarketProcessor.bind({
    chainId: FuelNetwork.TEST_NET,
    address: '0x30bd67d27a021ae7acc982fdcbf905d3ea229f914e30b70860c0577457c87b19'
})
    // .onCallMatch_orders(async (order, ctx) => {
    //   for (const log of order.getLogsOfTypeTradeEvent()) {
    //     // record trade event
    //   }
    // })
    .onLogTradeOrderEvent(async (trade, ctx) => {
        const vol = trade.data.trade_price.mul(trade.data.trade_size).scaleDown(2 * 10)
        ctx.eventLogger.emit('trade', {
            distinctId: ctx.transaction?.sender,
            ...trade,
            vol: vol
        })
    })
    .onLogOrderChangeEvent(async (order, ctx) => {
        ctx.eventLogger.emit('order', {
            distinctId: ctx.transaction?.sender,
            ...order,
        })
    })
    .onLogCancelOrderEvent(async (market, ctx) => {
       //todo
    })
// .onCallOpen_order(async (order, ctx) => {
//   ctx.eventLogger.emit('openOrder', {
//     distinctId: ctx.transaction?.sender,
//   })
// })
