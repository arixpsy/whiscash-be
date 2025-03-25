import { and, asc, eq, ilike, isNull, not, SQL, sql } from 'drizzle-orm'
import type { NeonHttpQueryResult } from 'drizzle-orm/neon-http'
import type { PgRaw } from 'drizzle-orm/pg-core/query-builders/raw'
import type { RawWalletAndSpendingPeriodTotal } from '@/@types/wallets'
import { type GetWalletsRequest } from '@/@types/shared'
import {
  spendingPeriodEnum,
  transactionsTable,
  walletsTable,
} from '@/db/schema'
import { db } from '@/utils/db'

type NewWallet = typeof walletsTable.$inferInsert

// Filter Conditions
const UserIdEqualTo = (userId: string) => eq(walletsTable.userId, userId)
const CurrencyEqualTo = (currency: string) =>
  eq(walletsTable.currency, currency)
const SubWalletofEqualTo = (walletId: number) =>
  eq(walletsTable.subWalletOf, walletId)
const WalletIdEqualTo = (walletId: number) => eq(walletsTable.id, walletId)
const SubWalletofIsNull = isNull(walletsTable.subWalletOf)
const ArchivedAtIsNull = isNull(walletsTable.archivedAt)
const ArchivedAtIsNotNull = not(isNull(walletsTable.archivedAt))
const DeletedAtAtIsNull = isNull(walletsTable.deletedAt)
const NameLike = (searchPhrase: string) =>
  ilike(walletsTable.name, `%${searchPhrase}%`)

// Sort Values
const SortByOrderIndex = asc(walletsTable.orderIndex)
const SortByCreatedAt = asc(walletsTable.createdAt)

const archiveWallet = async (walletId: number) => {
  // TODO: update orderIndex of all wallets that have a higher orderIndex
  // TODO: set orderIndex to -1 for archived wallet
  const archivedWallet = await db
    .update(walletsTable)
    .set({ archivedAt: sql`NOW()`, updatedAt: sql`NOW()` })
    .where(WalletIdEqualTo(walletId))
    .returning()

  return archivedWallet[0]
}

const deleteWallet = async (walletId: number) => {
  // TODO: update orderIndex of all wallets that have a higher orderIndex
  const deletedWallet = await db
    .delete(walletsTable)
    .where(WalletIdEqualTo(walletId))
    .returning()

  return deletedWallet[0]
}

const getWallet = async (walletId: number) => {
  const wallets = await db
    .select()
    .from(walletsTable)
    .where(and(WalletIdEqualTo(walletId), DeletedAtAtIsNull))

  return wallets[0]
}

const getWallets = (filters: Array<SQL>, sortBy: SQL) =>
  db
    .select()
    .from(walletsTable)
    .where(and(...filters))
    .orderBy(sortBy)

const getAllDashboardWallets = async (userId: string, timezone: string) => {
  const result: PgRaw<NeonHttpQueryResult<RawWalletAndSpendingPeriodTotal>> =
    db.execute(sql`
    SELECT
      w.id, w.name, w.currency, w.country, w.spending_period "spendingPeriod", w.order_index "orderIndex", w.archived_at "archivedAt", w.sub_wallet_of "subWalletOf", w.updated_at "updatedAt", w.created_at "createdAt", w.deleted_at "deletedAt",
      COALESCE(SUM(t.amount), 0) AS "spendingPeriodTotal"
      FROM wallets w
    LEFT JOIN transactions t
    ON (t.wallet_id = w.id OR t.wallet_id IN (SELECT id FROM wallets WHERE sub_wallet_of = w.id))
    AND (
      CASE 
        WHEN w.spending_period = 'DAY'   THEN t.paid_at >= DATE_TRUNC('day', NOW(), ${timezone})
        WHEN w.spending_period = 'WEEK'  THEN t.paid_at >= DATE_TRUNC('week', NOW(), ${timezone})
        WHEN w.spending_period = 'MONTH' THEN t.paid_at >= DATE_TRUNC('month', NOW(), ${timezone})
        WHEN w.spending_period = 'YEAR'  THEN t.paid_at >= DATE_TRUNC('year', NOW(), ${timezone})
        WHEN w.spending_period = 'ALL'   THEN TRUE
      END
    )
    where w.user_id = ${userId} AND w.archived_at IS NULL
    GROUP BY w.id
    order by w.order_index asc
    `)

  return (await result).rows
}

const getAllWallets = (
  userId: string,
  { searchPhrase, type }: GetWalletsRequest
) =>
  getWallets(
    [
      UserIdEqualTo(userId),
      DeletedAtAtIsNull,
      ...(type === 'ACTIVE' ? [ArchivedAtIsNull] : []),
      ...(type === 'ARCHIVED' ? [ArchivedAtIsNotNull] : []),
      ...(searchPhrase ? [NameLike(searchPhrase)] : []),
    ],
    SortByOrderIndex
  )

const getAllMainWallets = (
  userId: string,
  { searchPhrase, currency }: GetWalletsRequest
) =>
  getWallets(
    [
      UserIdEqualTo(userId),
      SubWalletofIsNull,
      ArchivedAtIsNull,
      DeletedAtAtIsNull,
      ...(searchPhrase ? [NameLike(searchPhrase)] : []),
      ...(currency ? [CurrencyEqualTo(currency)] : []),
    ],
    SortByCreatedAt
  )

const getWalletSubWallets = (walletId: number) =>
  db
    .select()
    .from(walletsTable)
    .where(and(SubWalletofEqualTo(walletId), DeletedAtAtIsNull))

const insertWallet = async (wallet: NewWallet) => {
  const userWalletCount = db.$with('user_wallet_count').as(
    db
      .select({ value: sql`count(*)`.as('value') })
      .from(walletsTable)
      .where(eq(walletsTable.userId, wallet.userId))
  )

  const wallets = await db
    .with(userWalletCount)
    .insert(walletsTable)
    .values({
      ...wallet,
      orderIndex: sql`(select * from ${userWalletCount})`,
    })
    .returning()

  return wallets[0]
}

const unarchiveWallet = async (walletId: number) => {
  // TODO: update orderIndex of wallet to the highest orderIndex + 1
  const archivedWallet = await db
    .update(walletsTable)
    .set({ archivedAt: null, updatedAt: sql`NOW()` })
    .where(WalletIdEqualTo(walletId))
    .returning()

  return archivedWallet[0]
}

const updateWallet = async (id: number, wallet: Partial<NewWallet>) => {
  const updatedFields = {
    name: wallet.name,
    spendingPeriod: wallet.spendingPeriod,
    subWalletOf: wallet.subWalletOf,
    updatedAt: sql`NOW()`,
  }

  const wallets = await db
    .update(walletsTable)
    .set(updatedFields)
    .where(WalletIdEqualTo(id))
    .returning()

  return wallets[0]
}

const walletDAO = {
  archiveWallet,
  deleteWallet,
  getAllDashboardWallets,
  getAllWallets,
  getAllMainWallets,
  getWallet,
  getWalletSubWallets,
  insertWallet,
  unarchiveWallet,
  updateWallet,
}

export default walletDAO
