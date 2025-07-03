import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { Category, objectToPgEnum, SpendingPeriod } from '@/utils/enum'

const timestamps = {
  updatedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp(),
}

export const spendingPeriodEnum = pgEnum(
  'spending_period',
  objectToPgEnum(SpendingPeriod)
)

export const categoryEnum = pgEnum('category', objectToPgEnum(Category))

export const settingsTable = pgTable('settings', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar().notNull(),
  timezone: varchar().notNull(),
  imageEndpointCount: integer().default(0).notNull(),
  imageEndpointEnabled: boolean().default(false).notNull(),
})

export const walletsTable = pgTable(
  'wallets',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar().notNull(),
    name: varchar({ length: 50 }).notNull(),
    currency: varchar({ length: 3 }).notNull(),
    country: varchar({ length: 2 }).notNull(),
    spendingPeriod: spendingPeriodEnum('spending_period').default(
      SpendingPeriod.Month
    ),
    orderIndex: integer().default(0),
    archivedAt: timestamp(),
    subWalletOf: integer(),
    ...timestamps,
  },
  (table) => [
    index('user_id_idx').on(table.userId),
    index('sub_wallet_of_idx').on(table.subWalletOf),
    index('order_index_idx').on(table.orderIndex),
  ]
)

export const walletsRelations = relations(walletsTable, ({ many }) => ({
  transactions: many(transactionsTable),
}))

export const transactionsTable = pgTable(
  'transactions',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    walletId: integer()
      .references(() => walletsTable.id)
      .notNull(),
    amount: doublePrecision().notNull(),
    category: categoryEnum('category').default(Category.Others),
    description: varchar({ length: 255 }).notNull(),
    paidAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
    subscriptionId: integer(),
    ...timestamps,
  },
  (table) => [
    index('wallet_id_idx').on(table.walletId),
    index('subscription_id_idx').on(table.subscriptionId),
    index('paid_at_idx').on(table.paidAt),
  ]
)

export const transactionsRelations = relations(
  transactionsTable,
  ({ one }) => ({
    wallet: one(walletsTable, {
      fields: [transactionsTable.walletId],
      references: [walletsTable.id],
    }),
  })
)

// export const subscriptionsTable = pgTable('subscriptions', {
// id: integer().primaryKey().generatedAlwaysAsIdentity(),
// walletId: integer().references(() => walletsTable.id),
// amount: numeric(),
// frequency: varchar(), // Options like 'daily', 'weekly', 'monthly', 'yearly'
// startDate: timestamp().defaultNow(),
// nextPaymentDate: timestamp(),
// description: varchar(),
// ...timestamps,
// })
