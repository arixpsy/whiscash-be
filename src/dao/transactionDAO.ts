import type { NeonHttpQueryResult } from 'drizzle-orm/neon-http'
import type { PgRaw } from 'drizzle-orm/pg-core/query-builders/raw'
import {
  and,
  between,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  sql,
  type SQL,
} from 'drizzle-orm'
import type { DateTime } from 'luxon'
import type { RawWalletChartData } from '@/@types/transactions'
import walletDAO from '@/dao/walletDAO'
import { transactionsTable, walletsTable } from '@/db/schema'
import { db } from '@/utils/db'
import { SpendingPeriod } from '@/utils/enum'

type NewTransaction = typeof transactionsTable.$inferInsert

const transactionResponse = {
  id: transactionsTable.id,
  walletId: transactionsTable.walletId,
  amount: transactionsTable.amount,
  category: transactionsTable.category,
  description: transactionsTable.description,
  paidAt: transactionsTable.paidAt,
  subscriptionId: transactionsTable.subscriptionId,
  updatedAt: transactionsTable.updatedAt,
  createdAt: transactionsTable.createdAt,
  deletedAt: transactionsTable.deletedAt,
  country: walletsTable.country,
  currency: walletsTable.currency,
  name: walletsTable.name,
  subWalletOf: walletsTable.subWalletOf,
}

// Filter Conditions
const TransactionIdEqualTo = (transactionId: number) =>
  eq(transactionsTable.id, transactionId)
const WalletIdEqualTo = (walletId: number) =>
  eq(transactionsTable.walletId, walletId)
const WalletIdIn = (walletIds: Array<number>) =>
  inArray(transactionsTable.walletId, walletIds)
const DeletedAtAtIsNull = isNull(transactionsTable.deletedAt)
const DescriptionLike = (searchPhrase: string) =>
  ilike(transactionsTable.description, `%${searchPhrase}%`)
const PaidAtBetween = (startDate: string, endDate: string) =>
  between(transactionsTable.paidAt, startDate, endDate)

// Sort Values
const SortByPaidAt = desc(transactionsTable.paidAt)

const deleteTransaction = async (transactionId: number) => {
  const deletedTransaction = await db
    .delete(transactionsTable)
    .where(TransactionIdEqualTo(transactionId))
    .returning()

  return deletedTransaction[0]
}

const deleteTransactionsByWalletId = async (walletId: number) =>
  db.delete(transactionsTable).where(WalletIdEqualTo(walletId)).returning()

const getTransactionById = async (transactionId: number) => {
  const transaction = await db
    .select(transactionResponse)
    .from(transactionsTable)
    .innerJoin(walletsTable, eq(transactionsTable.walletId, walletsTable.id))
    .where(TransactionIdEqualTo(transactionId))

  return transaction[0]
}

const getTransactions = (
  filters: Array<SQL>,
  sortBy: SQL,
  limit: number,
  offset?: number
) => {
  return db
    .select(transactionResponse)
    .from(transactionsTable)
    .innerJoin(walletsTable, eq(transactionsTable.walletId, walletsTable.id))
    .where(and(...filters))
    .orderBy(sortBy)
    .limit(limit)
    .offset(offset ? offset : 0)
}

const getTransactionsByWalletId = async (
  walletId: number,
  limit: number,
  offset?: number
) => {
  const subWalletIds = (await walletDAO.getWalletSubWallets(walletId)).map(
    (r) => r.id
  )

  return getTransactions(
    [WalletIdIn([walletId, ...subWalletIds]), DeletedAtAtIsNull],
    SortByPaidAt,
    limit,
    offset
  )
}

const getTransactionsByDate = async (
  walletsIds: Array<number>,
  date: DateTime<true>,
  limit: number,
  offset?: number
) => {
  const startDate = date.toUTC().toSQL()
  const endDate = date
    .toUTC()
    .plus({ days: 1 })
    .minus({ milliseconds: 1 })
    .toSQL()

  return getTransactions(
    [WalletIdIn(walletsIds), PaidAtBetween(startDate, endDate)],
    SortByPaidAt,
    limit,
    offset
  )
}

// TODO: clean up this
const getWalletChartData = async (
  walletId: number,
  timezone: string,
  unit: SpendingPeriod,
  limit: number,
  offset: number
) => {
  if (unit === SpendingPeriod.All) {
    const result: PgRaw<NeonHttpQueryResult<RawWalletChartData>> =
      db.execute(sql`
      SELECT 
        NOW() "startPeriod", 
        CAST(ROUND(COALESCE(SUM(t.amount)::NUMERIC, 0), 2) AS FLOAT) AS "spendingPeriodTotal", 
        json_agg(
          jsonb_build_object(
            'id', t.id,
            'walletId', t.wallet_id,
            'amount', t.amount,
            'category', t.category,
            'description', t.description,
            'paidAt', t.paid_at,
            'subscriptionId', t.subscription_id,
            'createdAt', t.created_at,
            'updatedAt', t.updated_at,
            'deletedAt', t.deleted_at
          )
        ) FILTER (WHERE t.id IS NOT NULL) AS transactions
      FROM wallets w
      LEFT JOIN transactions t
      ON w.id = t.wallet_id
      AND (t.wallet_id = ${walletId} OR t.wallet_id IN (SELECT id FROM wallets WHERE sub_wallet_of = ${walletId}))
    `)

    return (await result).rows
  }

  const ONE = '1'

  const result: PgRaw<NeonHttpQueryResult<RawWalletChartData>> = db.execute(sql`
    WITH date_ranges AS (
      SELECT generate_series(
        DATE_TRUNC(${unit}, NOW() AT TIME ZONE ${timezone}) - ${limit + offset + unit}::INTERVAL, 
        DATE_TRUNC(${unit}, NOW() AT TIME ZONE ${timezone}) - ${offset + unit}::INTERVAL, 
        ${ONE + unit}::INTERVAL
      ) AS "startPeriod"
    ),

    sub_wallets AS (
      SELECT id, name FROM wallets WHERE sub_wallet_of = ${walletId}
    )

    SELECT 
      d."startPeriod", 
      CAST(ROUND(COALESCE(SUM(t.amount)::NUMERIC, 0), 2) AS FLOAT) AS "spendingPeriodTotal", 
      json_agg(
        jsonb_build_object(
          'id', t.id,
          'walletId', t.wallet_id,
          'amount', t.amount,
          'category', COALESCE(sw.name::TEXT, t.category::TEXT),
          'description', t.description,
          'paidAt', t.paid_at,
          'subscriptionId', t.subscription_id,
          'createdAt', t.created_at,
          'updatedAt', t.updated_at,
          'deletedAt', t.deleted_at
        )
      ) FILTER (WHERE t.id IS NOT NULL) AS transactions
    FROM date_ranges d
    LEFT JOIN transactions t
    ON (t.wallet_id = ${walletId} OR t.wallet_id IN (SELECT id FROM sub_wallets))
    AND t.paid_at >= d."startPeriod" AT TIME ZONE ${timezone}
    AND t.paid_at < (d."startPeriod" + ${ONE + unit}::INTERVAL) AT TIME ZONE ${timezone}
    LEFT JOIN sub_wallets sw ON t.wallet_id = sw.id
    GROUP BY d."startPeriod"
    ORDER BY d."startPeriod" DESC
    LIMIT ${limit}
  `)

  return (await result).rows
}

const insertTransaction = async (transaction: NewTransaction) => {
  const transactions = await db
    .insert(transactionsTable)
    .values(transaction)
    .returning()

  return transactions[0]
}

const updateTransaction = async (id: number, transaction: NewTransaction) => {
  const updatedFields = {
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    walletId: transaction.walletId,
    paidAt: transaction.paidAt,
    updatedAt: sql`NOW()`,
  }

  const transactions = await db
    .update(transactionsTable)
    .set(updatedFields)
    .where(TransactionIdEqualTo(id))
    .returning()

  return transactions[0]
}

const transactionDAO = {
  deleteTransaction,
  deleteTransactionsByWalletId,
  getTransactionsByDate,
  getTransactionById,
  getTransactionsByWalletId,
  getWalletChartData,
  insertTransaction,
  updateTransaction,
}

export default transactionDAO
