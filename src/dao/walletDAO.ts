import { eq, sql } from 'drizzle-orm'
import { walletsTable } from '@/db/schema'
import { db } from '@/utils/db'

type NewWallet = typeof walletsTable.$inferInsert

const getWallets = (userId: string) =>
  db
    .select({
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
    })
    .from(walletsTable)
    .where(eq(walletsTable.userId, userId))

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
    .returning({
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
    })

  return wallets[0]
}

const walletDAO = {
  getWallets,
  insertWallet,
}

export default walletDAO
