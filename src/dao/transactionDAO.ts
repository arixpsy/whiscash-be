import { and, asc, eq, ilike, isNull, type SQL } from 'drizzle-orm'
import { transactionsTable, walletsTable } from '@/db/schema'
import { db } from '@/utils/db'

const transactionResponse = {
  id: transactionsTable.id,
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
const SortByPaidAt = asc(transactionsTable.paidAt)

const getTransactions = (filters: Array<SQL>, sortBy: SQL) => {
  return db
    .select(transactionResponse)
    .from(transactionsTable)
    .where(and(...filters))
    .orderBy(sortBy)
}

const getTransactionsByWalletId = (walletId: number) =>
  getTransactions([WallletIdEqualTo(walletId), DeletedAtAtIsNull], SortByPaidAt)

const transactionDAO = {
  getTransactionsByWalletId,
}

export default transactionDAO
