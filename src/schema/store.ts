
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
	@Column("Int")
	txCount: Int

	@Required
	@Column("Int")
	depositCount: Int

	@Required
	@Column("Int")
	withdrawCount: Int

	@Required
	@Column("Int")
	openOrderCount: Int

	@Required
	@Column("Int")
	cancelOrderCount: Int

	@Required
	@Column("Int")
	tradeCount: Int

	@Required
	@Column("Float")
	baseDecimalAmount: Float

	@Required
	@Column("Float")
	quoteDecimalAmount: Float

	@Required
	@Column("Float")
	tvl: Float

	@Required
	@Column("Int")
	timestamp: Int
  constructor(data: Partial<Balance>) {super()}
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
  constructor(data: Partial<TotalVolume>) {super()}
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
  constructor(data: Partial<TotalMarketVolume>) {super()}
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
  constructor(data: Partial<TradeEvent>) {super()}
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
  constructor(data: Partial<DailyVolume>) {super()}
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
  constructor(data: Partial<DailyMarketVolume>) {super()}
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
  constructor(data: Partial<UserScoreSnapshot>) {super()}
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
  constructor(data: Partial<Pools>) {super()}
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
  constructor(data: Partial<Order>) {super()}
}


const source = `type Balance @entity {
  id: ID!
  user: String!
  market: String!
  liquidBaseAmount: BigInt!
  liquidQuoteAmount: BigInt!
  lockedBaseAmount: BigInt!
  lockedQuoteAmount: BigInt!
  
  txCount: Int! 
  depositCount: Int! 
  withdrawCount: Int! 
  openOrderCount: Int! 
  cancelOrderCount: Int! 
  tradeCount: Int! 
  
  baseDecimalAmount: Float!
  quoteDecimalAmount: Float!

  tvl: Float!
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
}

# type UserScoreSnapshotNew @entity {
#   id: ID!
#   timestamp: Int!
#   block_date: String!
#   chain_id: Int!
#   block_number: Int!
#   user_address: String!
#   pool_address: String!
#   total_value_locked_score: Float!
#   market_depth_score: Int
# }

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
