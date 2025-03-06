import { and, asc, eq, ilike, isNull, SQL, sql } from 'drizzle-orm'
import type { NeonHttpQueryResult } from 'drizzle-orm/neon-http'
import type { PgRaw } from 'drizzle-orm/pg-core/query-builders/raw'
import type { RawWalletAndSpendingPeriodTotal } from '@/@types/wallets'
import { type GetWalletsRequest } from '@/@types/shared'
import { transactionsTable, walletsTable } from '@/db/schema'
import { db } from '@/utils/db'

type NewWallet = typeof walletsTable.$inferInsert

// Filter Conditions
const UserIdEqualTo = (userId: string) => eq(walletsTable.userId, userId)
const CurrencyEqualTo = (currency: string) =>
  eq(walletsTable.currency, currency)
const SubWalletofIsNull = isNull(walletsTable.subWalletOf)
const ArchivedAtIsNull = isNull(walletsTable.archivedAt)
const DeletedAtAtIsNull = isNull(walletsTable.deletedAt)
const NameLike = (searchPhrase: string) =>
  ilike(walletsTable.name, `%${searchPhrase}%`)

// Sort Values
const SortByOrderIndex = asc(walletsTable.orderIndex)
const SortByCreatedAt = asc(walletsTable.createdAt)

const getWallets = (filters: Array<SQL>, sortBy: SQL) => {
  return db
    .select()
    .from(walletsTable)
    .where(and(...filters))
    .orderBy(sortBy)
}

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
        WHEN w.spending_period = 'DAY'   THEN t.paid_at >= NOW() AT TIME ZONE ${timezone}
        WHEN w.spending_period = 'WEEK'  THEN t.paid_at >= DATE_TRUNC('week', NOW() AT TIME ZONE ${timezone})
        WHEN w.spending_period = 'MONTH' THEN t.paid_at >= DATE_TRUNC('month', NOW() AT TIME ZONE ${timezone})
        WHEN w.spending_period = 'YEAR'  THEN t.paid_at >= DATE_TRUNC('year', NOW() AT TIME ZONE ${timezone})
        WHEN w.spending_period = 'ALL'   THEN TRUE
      END
    )
    where w.user_id = ${userId}
    GROUP BY w.id
    order by w.order_index asc
    `)

  return (await result).rows
}

const getAllWallets = (userId: string, { searchPhrase }: GetWalletsRequest) =>
  getWallets(
    [
      UserIdEqualTo(userId),
      ArchivedAtIsNull,
      DeletedAtAtIsNull,
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

const walletDAO = {
  getAllDashboardWallets,
  getAllWallets,
  getAllMainWallets,
  insertWallet,
}

export default walletDAO
