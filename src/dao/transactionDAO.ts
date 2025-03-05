import { and, desc, eq, ilike, isNull, type SQL } from 'drizzle-orm'
import { transactionsTable, walletsTable } from '@/db/schema'
import { db } from '@/utils/db'

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
}

// Filter Conditions
const WallletIdEqualTo = (walletId: number) =>
  eq(transactionsTable.walletId, walletId)
const DeletedAtAtIsNull = isNull(transactionsTable.deletedAt)
const DescriptionLike = (searchPhrase: string) =>
  ilike(transactionsTable.description, `%${searchPhrase}%`)

// Sort Values
const SortByPaidAt = desc(transactionsTable.paidAt)

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

const getTransactionsByWalletId = (
  walletId: number,
  limit: number,
  offset?: number
) =>
  getTransactions(
    [WallletIdEqualTo(walletId), DeletedAtAtIsNull],
    SortByPaidAt,
    limit,
    offset
  )

const insertTransaction = async (transaction: NewTransaction) => {
  const transactions = await db
    .insert(transactionsTable)
    .values(transaction)
    .returning()

  return transactions[0]
}

const transactionDAO = {
  getTransactionsByWalletId,
  insertTransaction,
}

export default transactionDAO
