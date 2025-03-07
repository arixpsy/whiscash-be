import { and, desc, eq, ilike, inArray, isNull, type SQL } from 'drizzle-orm'
import walletDAO from '@/dao/walletDAO'
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
const TransactionIdEqualTo = (transactionId: number) =>
  eq(transactionsTable.id, transactionId)
const WallletIdEqualTo = (walletId: number) =>
  eq(transactionsTable.walletId, walletId)
const WalletIdIn = (walletIds: Array<number>) =>
  inArray(transactionsTable.walletId, walletIds)
const DeletedAtAtIsNull = isNull(transactionsTable.deletedAt)
const DescriptionLike = (searchPhrase: string) =>
  ilike(transactionsTable.description, `%${searchPhrase}%`)

// Sort Values
const SortByPaidAt = desc(transactionsTable.paidAt)

const deleteTransaction = async (transactionId: number) => {
  const deletedTransaction = await db
    .delete(transactionsTable)
    .where(TransactionIdEqualTo(transactionId))
    .returning()

  return deletedTransaction[0]
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

const insertTransaction = async (transaction: NewTransaction) => {
  const transactions = await db
    .insert(transactionsTable)
    .values(transaction)
    .returning()

  return transactions[0]
}

const transactionDAO = {
  deleteTransaction,
  getTransactionsByWalletId,
  insertTransaction,
}

export default transactionDAO
