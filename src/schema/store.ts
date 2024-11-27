
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { String, Int, BigInt, Float, ID, Bytes, Timestamp, Boolean } from '@sentio/sdk/store'
import { Entity, Required, One, Many, Column, ListColumn, AbstractEntity } from '@sentio/sdk/store'
import { BigDecimal } from '@sentio/bigdecimal'
import { DatabaseSchema } from '@sentio/sdk'






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
	@Column("Float")
	tradeVolume: Float
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

@Entity("TradeEvent")
export class TradeEvent extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("Int")
	timestamp: Int

	@Required
	@Column("Float")
	volume: Float
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
	tradeVolume: Float
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


const source = `type Balance @entity {
  id: ID!
  user: String!
  market: String!
  liquidBaseAmount: BigInt!
  liquidQuoteAmount: BigInt!
  lockedBaseAmount: BigInt!
  lockedQuoteAmount: BigInt!
  tradeVolume: Float!
}

type TotalVolume @entity {
  id: ID!
  timestamp: Int!
  volume: Float!
}

type TradeEvent @entity {
  id: ID!
  timestamp: Int!
  volume: Float!
}

type DailyVolume @entity {
  id: ID!
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
  tradeVolume: Float!
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
`
DatabaseSchema.register({
  source,
  entities: {
    "Balance": Balance,
		"TotalVolume": TotalVolume,
		"TradeEvent": TradeEvent,
		"DailyVolume": DailyVolume,
		"UserScoreSnapshot": UserScoreSnapshot,
		"Pools": Pools
  }
})
