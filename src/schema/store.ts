
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { String, Int, BigInt, Float, ID, Bytes, Timestamp, Boolean } from '@sentio/sdk/store'
import { Entity, Required, One, Many, Column, ListColumn, AbstractEntity } from '@sentio/sdk/store'
import { BigDecimal } from '@sentio/bigdecimal'
import { DatabaseSchema } from '@sentio/sdk'

export enum OrderStatus {
  Active = "Active", Closed = "Closed", Canceled = "Canceled"
}
export enum OrderType {
  Sell = "Sell", Buy = "Buy"
}





interface BalanceConstructorInput {
  id: ID;
  user: String;
  market: String;
  liquidBaseAmount: BigInt;
  liquidQuoteAmount: BigInt;
  lockedBaseAmount: BigInt;
  lockedQuoteAmount: BigInt;
  baseAmount: BigInt;
  quoteAmount: BigInt;
  timestamp: Int;
}
@Entity("Balance")
export class Balance extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("String")
	user: String

	@Required
	@Column("String")
	market: String

	@Required
	@Column("BigInt")
	liquidBaseAmount: BigInt

	@Required
	@Column("BigInt")
	liquidQuoteAmount: BigInt

	@Required
	@Column("BigInt")
	lockedBaseAmount: BigInt

	@Required
	@Column("BigInt")
	lockedQuoteAmount: BigInt

	@Required
	@Column("BigInt")
	baseAmount: BigInt

	@Required
	@Column("BigInt")
	quoteAmount: BigInt

	@Required
	@Column("Int")
	timestamp: Int
  constructor(data: BalanceConstructorInput) {super()}
  
}


interface TotalVolumeConstructorInput {
  id: ID;
  timestamp: Int;
  volume: Float;
}
@Entity("TotalVolume")
export class TotalVolume extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("Int")
	timestamp: Int

	@Required
	@Column("Float")
	volume: Float
  constructor(data: TotalVolumeConstructorInput) {super()}
  
}


interface TotalMarketVolumeConstructorInput {
  id: ID;
  market: String;
  timestamp: Int;
  volume: Float;
}
@Entity("TotalMarketVolume")
export class TotalMarketVolume extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("String")
	market: String

	@Required
	@Column("Int")
	timestamp: Int

	@Required
	@Column("Float")
	volume: Float
  constructor(data: TotalMarketVolumeConstructorInput) {super()}
  
}


interface TradeEventConstructorInput {
  id: ID;
  market: String;
  timestamp: Int;
  volume: Float;
  seller: String;
  buyer: String;
  price: Float;
  amount: Float;
  date: String;
}
@Entity("TradeEvent")
export class TradeEvent extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("String")
	market: String

	@Required
	@Column("Int")
	timestamp: Int

	@Required
	@Column("Float")
	volume: Float

	@Required
	@Column("String")
	seller: String

	@Required
	@Column("String")
	buyer: String

	@Required
	@Column("Float")
	price: Float

	@Required
	@Column("Float")
	amount: Float

	@Required
	@Column("String")
	date: String
  constructor(data: TradeEventConstructorInput) {super()}
  
}


interface DailyVolumeConstructorInput {
  id: ID;
  timestamp: Int;
  volume: Float;
}
@Entity("DailyVolume")
export class DailyVolume extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("Int")
	timestamp: Int

	@Required
	@Column("Float")
	volume: Float
  constructor(data: DailyVolumeConstructorInput) {super()}
  
}


interface DailyMarketVolumeConstructorInput {
  id: ID;
  market: String;
  timestamp: Int;
  volume: Float;
}
@Entity("DailyMarketVolume")
export class DailyMarketVolume extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("String")
	market: String

	@Required
	@Column("Int")
	timestamp: Int

	@Required
	@Column("Float")
	volume: Float
  constructor(data: DailyMarketVolumeConstructorInput) {super()}
  
}


interface UserScoreSnapshotConstructorInput {
  id: ID;
  timestamp: Int;
  block_date: String;
  chain_id: Int;
  block_number: Int;
  user_address: String;
  pool_address: String;
  total_value_locked_score: Float;
  market_depth_score?: Int;
  marketPrice: Float;
  lowerLimit: Float;
  upperLimit: Float;
  percentile: Float;
}
@Entity("UserScoreSnapshot")
export class UserScoreSnapshot extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("Int")
	timestamp: Int

	@Required
	@Column("String")
	block_date: String

	@Required
	@Column("Int")
	chain_id: Int

	@Required
	@Column("Int")
	block_number: Int

	@Required
	@Column("String")
	user_address: String

	@Required
	@Column("String")
	pool_address: String

	@Required
	@Column("Float")
	total_value_locked_score: Float

	@Column("Int")
	market_depth_score?: Int

	@Required
	@Column("Float")
	marketPrice: Float

	@Required
	@Column("Float")
	lowerLimit: Float

	@Required
	@Column("Float")
	upperLimit: Float

	@Required
	@Column("Float")
	percentile: Float
  constructor(data: UserScoreSnapshotConstructorInput) {super()}
  
}


interface PoolsConstructorInput {
  id: ID;
  chain_id: Int;
  creation_block_number: Int;
  timestamp: Int;
  pool_address: String;
  lp_token_address: String;
  lp_token_symbol: String;
  token_address: String;
  token_symbol: String;
  token_decimals: String;
  token_index: Int;
  fee_rate: Float;
  dex_type: String;
}
@Entity("Pools")
export class Pools extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("Int")
	chain_id: Int

	@Required
	@Column("Int")
	creation_block_number: Int

	@Required
	@Column("Int")
	timestamp: Int

	@Required
	@Column("String")
	pool_address: String

	@Required
	@Column("String")
	lp_token_address: String

	@Required
	@Column("String")
	lp_token_symbol: String

	@Required
	@Column("String")
	token_address: String

	@Required
	@Column("String")
	token_symbol: String

	@Required
	@Column("String")
	token_decimals: String

	@Required
	@Column("Int")
	token_index: Int

	@Required
	@Column("Float")
	fee_rate: Float

	@Required
	@Column("String")
	dex_type: String
  constructor(data: PoolsConstructorInput) {super()}
  
}


interface OrderConstructorInput {
  id: ID;
  amount: BigInt;
  market: String;
  orderType: OrderType;
  price: BigInt;
  user: String;
  status: OrderStatus;
  initialAmount: BigInt;
  timestamp: Int;
  initialTimestamp: Int;
}
@Entity("Order")
export class Order extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("BigInt")
	amount: BigInt

	@Required
	@Column("String")
	market: String

	@Required
	@Column("String")
	orderType: OrderType

	@Required
	@Column("BigInt")
	price: BigInt

	@Required
	@Column("String")
	user: String

	@Required
	@Column("String")
	status: OrderStatus

	@Required
	@Column("BigInt")
	initialAmount: BigInt

	@Required
	@Column("Int")
	timestamp: Int

	@Required
	@Column("Int")
	initialTimestamp: Int
  constructor(data: OrderConstructorInput) {super()}
  
}


const source = `type Balance @entity {
  id: ID!
  user: String!
  market: String!
  liquidBaseAmount: BigInt!
  liquidQuoteAmount: BigInt!
  lockedBaseAmount: BigInt!
  lockedQuoteAmount: BigInt!

  baseAmount: BigInt!
  quoteAmount: BigInt!

  # tvl: Float!
  # tvlOrders: Float!
  timestamp: Int!
}

type TotalVolume @entity {
  id: ID!
  timestamp: Int!
  volume: Float!
}

type TotalMarketVolume @entity {
  id: ID!
  market: String!
  timestamp: Int!
  volume: Float!
}

type TradeEvent @entity {
  id: ID!
  market: String!
  timestamp: Int!
  volume: Float!
  seller: String!
  buyer: String!
  price: Float!
  amount: Float!
  date: String!
}

type DailyVolume @entity {
  id: ID!
  timestamp: Int!
  volume: Float!
}

type DailyMarketVolume @entity {
  id: ID!
  market: String!
  timestamp: Int!
  volume: Float!
}

type UserScoreSnapshot @entity {
  id: ID!
  timestamp: Int!
  block_date: String!
  chain_id: Int!
  block_number: Int!
  user_address: String!
  pool_address: String!
  total_value_locked_score: Float!
  market_depth_score: Int
  marketPrice: Float!
  lowerLimit: Float!
  upperLimit: Float!
  percentile: Float!
}

type Pools @entity {
  id: ID!
  chain_id: Int!
  creation_block_number: Int!
  timestamp: Int!
  pool_address: String!
  lp_token_address: String!
  lp_token_symbol: String!
  token_address: String!
  token_symbol: String!
  token_decimals: String!
  token_index: Int!
  fee_rate: Float!
  dex_type: String!
}

enum OrderStatus {
  Active
  Closed
  Canceled
}

enum OrderType {
  Sell
  Buy
}

type Order @entity {
  id: ID!
  amount: BigInt!
  market: String! @index
  orderType: OrderType! @index
  price: BigInt! @index
  user: String! @index
  status: OrderStatus! @index
  initialAmount: BigInt!
  timestamp: Int!
  initialTimestamp: Int!
  # asset: String! @index
}
`
DatabaseSchema.register({
  source,
  entities: {
    "Balance": Balance,
		"TotalVolume": TotalVolume,
		"TotalMarketVolume": TotalMarketVolume,
		"TradeEvent": TradeEvent,
		"DailyVolume": DailyVolume,
		"DailyMarketVolume": DailyMarketVolume,
		"UserScoreSnapshot": UserScoreSnapshot,
		"Pools": Pools,
		"Order": Order
  }
})
