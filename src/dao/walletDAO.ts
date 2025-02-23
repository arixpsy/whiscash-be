import { and, asc, desc, eq, ilike, isNull, SQL, sql } from 'drizzle-orm'
import { walletsTable } from '@/db/schema'
import { db } from '@/utils/db'

type NewWallet = typeof walletsTable.$inferInsert
type GetWalletFilters = {
  searchPhrase?: string
  currency?: string
}

// Return Types
const WalletResponse = {
  id: walletsTable.id,
  name: walletsTable.name,
  currency: walletsTable.currency,
  country: walletsTable.country,
  defaultSpendingPeriod: walletsTable.defaultSpendingPeriod,
  orderIndex: walletsTable.orderIndex,
  archivedAt: walletsTable.archivedAt,
  subWalletOf: walletsTable.subWalletOf,
  updatedAt: walletsTable.updatedAt,
  createdAt: walletsTable.createdAt,
  deletedAt: walletsTable.deletedAt,
}

// Filter Conditions
const UserIdEqualTo = (userId: string) => eq(walletsTable.userId, userId)
const CurrencyEqualTo = (currency: string) =>
  eq(walletsTable.currency, currency)
const SubWalletofIsNull = isNull(walletsTable.subWalletOf)
const ArchivedAtIsNull = isNull(walletsTable.archivedAt)
const NameLike = (searchPhrase: string) =>
  ilike(walletsTable.name, `%${searchPhrase}%`)

// Sort Values
const SortByOrderIndex = asc(walletsTable.orderIndex)
const SortByCreatedAt = asc(walletsTable.createdAt)

const getWallets = (filters: Array<SQL>, sortBy: SQL) => {
  return db
    .select(WalletResponse)
    .from(walletsTable)
    .where(and(...filters))
    .orderBy(sortBy)
}

const getAllWallets = (userId: string, { searchPhrase }: GetWalletFilters) =>
  getWallets(
    [
      UserIdEqualTo(userId),
      ArchivedAtIsNull,
      ...(searchPhrase ? [NameLike(searchPhrase)] : []),
    ],
    SortByOrderIndex
  )

const getAllMainWallets = (
  userId: string,
  { searchPhrase, currency }: GetWalletFilters
) =>
  getWallets(
    [
      UserIdEqualTo(userId),
      SubWalletofIsNull,
      ArchivedAtIsNull,
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
    .returning(WalletResponse)

  return wallets[0]
}

const walletDAO = {
  getAllWallets,
  getAllMainWallets,
  insertWallet,
}

export default walletDAO
