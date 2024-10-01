/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */
    
import { FuelAbstractProcessor, FuelContractContext, FuelProcessorConfig, TypedCall, FuelFetchConfig, FuelCall, FuelLog, addFuelProcessor, getFuelProcessor, FuelBaseProcessorTemplate } from '@sentio/sdk/fuel'
import {Option,Enum,Vec} from './common.js'
import {AssetTypeInput,AssetTypeOutput,LimitTypeInput,LimitTypeOutput,OrderChangeTypeInput,OrderChangeTypeOutput,OrderTypeInput,OrderTypeOutput,AccountErrorInput,AccountErrorOutput,AssetErrorInput,AssetErrorOutput,AuthErrorInput,AuthErrorOutput,MatchErrorInput,MatchErrorOutput,OrderErrorInput,OrderErrorOutput,ValueErrorInput,ValueErrorOutput,IdentityInput,IdentityOutput,ReentrancyErrorInput,ReentrancyErrorOutput,AccountInput,AccountOutput,BalanceInput,BalanceOutput,OrderInput,OrderOutput,OrderChangeInfoInput,OrderChangeInfoOutput,ProtocolFeeInput,ProtocolFeeOutput,CancelOrderEventInput,CancelOrderEventOutput,DepositEventInput,DepositEventOutput,OpenOrderEventInput,OpenOrderEventOutput,SetEpochEventInput,SetEpochEventOutput,SetMatcherRewardEventInput,SetMatcherRewardEventOutput,SetProtocolFeeEventInput,SetProtocolFeeEventOutput,SetStoreOrderChangeInfoEventInput,SetStoreOrderChangeInfoEventOutput,TradeOrderEventInput,TradeOrderEventOutput,WithdrawEventInput,WithdrawEventOutput,AddressInput,AddressOutput,AssetIdInput,AssetIdOutput,ContractIdInput,ContractIdOutput, SparkMarket} from './SparkMarket.js'

import type { BigNumberish, BN } from 'fuels';
import type { BytesLike, Bytes } from 'fuels';


namespace SparkMarketNS {
  export abstract class CallWithLogs<T extends Array<any>, R> extends TypedCall<T, R> {

    getLogsOfTypeReentrancyError(): Array<ReentrancyErrorOutput> {
      return this.logs?.filter(l =>["5557842539076482339"].includes(l.logId) ).map(l => l.data) as Array<ReentrancyErrorOutput>
    }

    getLogsOfTypeOrderError(): Array<OrderErrorOutput> {
      return this.logs?.filter(l =>["999626799421532101"].includes(l.logId) ).map(l => l.data) as Array<OrderErrorOutput>
    }

    getLogsOfTypeAuthError(): Array<AuthErrorOutput> {
      return this.logs?.filter(l =>["487470194140633944"].includes(l.logId) ).map(l => l.data) as Array<AuthErrorOutput>
    }

    getLogsOfTypeAccountError(): Array<AccountErrorOutput> {
      return this.logs?.filter(l =>["15329379498675066312"].includes(l.logId) ).map(l => l.data) as Array<AccountErrorOutput>
    }

    getLogsOfTypeCancelOrderEvent(): Array<CancelOrderEventOutput> {
      return this.logs?.filter(l =>["14676650066558707344"].includes(l.logId) ).map(l => l.data) as Array<CancelOrderEventOutput>
    }

    getLogsOfTypeValueError(): Array<ValueErrorOutput> {
      return this.logs?.filter(l =>["4038555509566971562"].includes(l.logId) ).map(l => l.data) as Array<ValueErrorOutput>
    }

    getLogsOfTypeAssetError(): Array<AssetErrorOutput> {
      return this.logs?.filter(l =>["16169998749359270814"].includes(l.logId) ).map(l => l.data) as Array<AssetErrorOutput>
    }

    getLogsOfTypeDepositEvent(): Array<DepositEventOutput> {
      return this.logs?.filter(l =>["12590297951544646752"].includes(l.logId) ).map(l => l.data) as Array<DepositEventOutput>
    }

    getLogsOfTypeOpenOrderEvent(): Array<OpenOrderEventOutput> {
      return this.logs?.filter(l =>["7812135309850120461"].includes(l.logId) ).map(l => l.data) as Array<OpenOrderEventOutput>
    }

    getLogsOfTypeSetEpochEvent(): Array<SetEpochEventOutput> {
      return this.logs?.filter(l =>["5744192922338635869"].includes(l.logId) ).map(l => l.data) as Array<SetEpochEventOutput>
    }

    getLogsOfTypeTradeOrderEvent(): Array<TradeOrderEventOutput> {
      return this.logs?.filter(l =>["18305104039093136274"].includes(l.logId) ).map(l => l.data) as Array<TradeOrderEventOutput>
    }

    getLogsOfTypeMatchError(): Array<MatchErrorOutput> {
      return this.logs?.filter(l =>["15838754841496526215"].includes(l.logId) ).map(l => l.data) as Array<MatchErrorOutput>
    }

    getLogsOfTypeSetMatcherRewardEvent(): Array<SetMatcherRewardEventOutput> {
      return this.logs?.filter(l =>["649664855397936830"].includes(l.logId) ).map(l => l.data) as Array<SetMatcherRewardEventOutput>
    }

    getLogsOfTypeSetProtocolFeeEvent(): Array<SetProtocolFeeEventOutput> {
      return this.logs?.filter(l =>["10772010129570911307"].includes(l.logId) ).map(l => l.data) as Array<SetProtocolFeeEventOutput>
    }

    getLogsOfTypeSetStoreOrderChangeInfoEvent(): Array<SetStoreOrderChangeInfoEventOutput> {
      return this.logs?.filter(l =>["3792793406740277287"].includes(l.logId) ).map(l => l.data) as Array<SetStoreOrderChangeInfoEventOutput>
    }

    getLogsOfTypeWithdrawEvent(): Array<WithdrawEventOutput> {
      return this.logs?.filter(l =>["10918704871079408520"].includes(l.logId) ).map(l => l.data) as Array<WithdrawEventOutput>
    }
  }


}

type LogIdFilter<T> = T | T[]
const LogReentrancyErrorId = "5557842539076482339"
const LogOrderErrorId = "999626799421532101"
const LogAuthErrorId = "487470194140633944"
const LogAccountErrorId = "15329379498675066312"
const LogCancelOrderEventId = "14676650066558707344"
const LogValueErrorId = "4038555509566971562"
const LogAssetErrorId = "16169998749359270814"
const LogDepositEventId = "12590297951544646752"
const LogOpenOrderEventId = "7812135309850120461"
const LogSetEpochEventId = "5744192922338635869"
const LogTradeOrderEventId = "18305104039093136274"
const LogMatchErrorId = "15838754841496526215"
const LogSetMatcherRewardEventId = "649664855397936830"
const LogSetProtocolFeeEventId = "10772010129570911307"
const LogSetStoreOrderChangeInfoEventId = "3792793406740277287"
const LogWithdrawEventId = "10918704871079408520"

export class SparkMarketProcessor extends FuelAbstractProcessor<SparkMarket> {
  static bind(options: Omit<FuelProcessorConfig, 'abi'>) {
    if (!options.name) {
      options.name = "SparkMarket"
    }
    let processor = getFuelProcessor(options) as SparkMarketProcessor
    if (!processor) {
      processor = new SparkMarketProcessor(SparkMarket.abi, {
        name: 'SparkMarket',
        ...options,
      })
      addFuelProcessor(options, processor)
    }
    return processor
  }

   

  
  onLogReentrancyError(handler: (log: FuelLog<ReentrancyErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<ReentrancyErrorOutput>([LogReentrancyErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogOrderError(handler: (log: FuelLog<OrderErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<OrderErrorOutput>([LogOrderErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogAuthError(handler: (log: FuelLog<AuthErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<AuthErrorOutput>([LogAuthErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogAccountError(handler: (log: FuelLog<AccountErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<AccountErrorOutput>([LogAccountErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogCancelOrderEvent(handler: (log: FuelLog<CancelOrderEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<CancelOrderEventOutput>([LogCancelOrderEventId], (log, ctx) => handler(log, ctx))
  }

  onLogValueError(handler: (log: FuelLog<ValueErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<ValueErrorOutput>([LogValueErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogAssetError(handler: (log: FuelLog<AssetErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<AssetErrorOutput>([LogAssetErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogDepositEvent(handler: (log: FuelLog<DepositEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<DepositEventOutput>([LogDepositEventId], (log, ctx) => handler(log, ctx))
  }

  onLogOpenOrderEvent(handler: (log: FuelLog<OpenOrderEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<OpenOrderEventOutput>([LogOpenOrderEventId], (log, ctx) => handler(log, ctx))
  }

  onLogSetEpochEvent(handler: (log: FuelLog<SetEpochEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<SetEpochEventOutput>([LogSetEpochEventId], (log, ctx) => handler(log, ctx))
  }

  onLogTradeOrderEvent(handler: (log: FuelLog<TradeOrderEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<TradeOrderEventOutput>([LogTradeOrderEventId], (log, ctx) => handler(log, ctx))
  }

  onLogMatchError(handler: (log: FuelLog<MatchErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<MatchErrorOutput>([LogMatchErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogSetMatcherRewardEvent(handler: (log: FuelLog<SetMatcherRewardEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<SetMatcherRewardEventOutput>([LogSetMatcherRewardEventId], (log, ctx) => handler(log, ctx))
  }

  onLogSetProtocolFeeEvent(handler: (log: FuelLog<SetProtocolFeeEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<SetProtocolFeeEventOutput>([LogSetProtocolFeeEventId], (log, ctx) => handler(log, ctx))
  }

  onLogSetStoreOrderChangeInfoEvent(handler: (log: FuelLog<SetStoreOrderChangeInfoEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<SetStoreOrderChangeInfoEventOutput>([LogSetStoreOrderChangeInfoEventId], (log, ctx) => handler(log, ctx))
  }

  onLogWithdrawEvent(handler: (log: FuelLog<WithdrawEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<WithdrawEventOutput>([LogWithdrawEventId], (log, ctx) => handler(log, ctx))
  }

}

export class SparkMarketProcessorTemplate extends FuelBaseProcessorTemplate<SparkMarket> {
  bindInternal(options: Omit<FuelProcessorConfig, 'abi'>) {
    return SparkMarketProcessor.bind(options)
  }

  
  onLogReentrancyError(handler: (log: FuelLog<ReentrancyErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<ReentrancyErrorOutput>([LogReentrancyErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogOrderError(handler: (log: FuelLog<OrderErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<OrderErrorOutput>([LogOrderErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogAuthError(handler: (log: FuelLog<AuthErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<AuthErrorOutput>([LogAuthErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogAccountError(handler: (log: FuelLog<AccountErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<AccountErrorOutput>([LogAccountErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogCancelOrderEvent(handler: (log: FuelLog<CancelOrderEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<CancelOrderEventOutput>([LogCancelOrderEventId], (log, ctx) => handler(log, ctx))
  }

  onLogValueError(handler: (log: FuelLog<ValueErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<ValueErrorOutput>([LogValueErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogAssetError(handler: (log: FuelLog<AssetErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<AssetErrorOutput>([LogAssetErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogDepositEvent(handler: (log: FuelLog<DepositEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<DepositEventOutput>([LogDepositEventId], (log, ctx) => handler(log, ctx))
  }

  onLogOpenOrderEvent(handler: (log: FuelLog<OpenOrderEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<OpenOrderEventOutput>([LogOpenOrderEventId], (log, ctx) => handler(log, ctx))
  }

  onLogSetEpochEvent(handler: (log: FuelLog<SetEpochEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<SetEpochEventOutput>([LogSetEpochEventId], (log, ctx) => handler(log, ctx))
  }

  onLogTradeOrderEvent(handler: (log: FuelLog<TradeOrderEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<TradeOrderEventOutput>([LogTradeOrderEventId], (log, ctx) => handler(log, ctx))
  }

  onLogMatchError(handler: (log: FuelLog<MatchErrorOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<MatchErrorOutput>([LogMatchErrorId], (log, ctx) => handler(log, ctx))
  }

  onLogSetMatcherRewardEvent(handler: (log: FuelLog<SetMatcherRewardEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<SetMatcherRewardEventOutput>([LogSetMatcherRewardEventId], (log, ctx) => handler(log, ctx))
  }

  onLogSetProtocolFeeEvent(handler: (log: FuelLog<SetProtocolFeeEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<SetProtocolFeeEventOutput>([LogSetProtocolFeeEventId], (log, ctx) => handler(log, ctx))
  }

  onLogSetStoreOrderChangeInfoEvent(handler: (log: FuelLog<SetStoreOrderChangeInfoEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<SetStoreOrderChangeInfoEventOutput>([LogSetStoreOrderChangeInfoEventId], (log, ctx) => handler(log, ctx))
  }

  onLogWithdrawEvent(handler: (log: FuelLog<WithdrawEventOutput>, ctx: FuelContractContext<SparkMarket>) => void | Promise<void>) {
    return super.onLog<WithdrawEventOutput>([LogWithdrawEventId], (log, ctx) => handler(log, ctx))
  }
}

