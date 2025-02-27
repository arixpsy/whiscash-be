import { Category, SpendingPeriod } from '@/utils/enum'
import { z } from 'zod'

const TransactionSchema = z.object({
  id: z.number(),
  walletId: z.number(),
  amount: z.string(),
  category: z.nativeEnum(Category),
  description: z.string(),
  paidAt: z.string(),
  subscriptionId: z.number().nullable(),
  updatedAt: z.string().nullable(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
})

const TransactionWithCurrencySchema = TransactionSchema.merge(
  z.object({
    currency: z.string(),
    country: z.string(),
  })
)

const WalletSchema = z.object({
  id: z.number(),
  name: z.string(),
  userId: z.string(),
  currency: z.string(),
  country: z.string(),
  spendingPeriod: z.nativeEnum(SpendingPeriod),
  orderIndex: z.number(),
  archivedAt: z.string().nullable(),
  subWalletOf: z.number().nullable(),
  updatedAt: z.string().nullable(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
})

const WalletWithSpendingPeriodTotalSchema = WalletSchema.merge(
  z.object({
    spendingPeriodTotal: z.string(),
  })
)

export const CreateTransactionRequestSchema = z.object({
  walletId: z.number(),
  amount: z.number(),
  category: z.nativeEnum(Category),
  description: z.string(),
  paidAt: z.string(),
})

export const CreateWalletRequestSchema = z.object({
  name: z.string().min(1).max(50),
  currency: z.string().length(3),
  country: z.string().length(2),
  spendingPeriod: z.nativeEnum(SpendingPeriod),
  subWalletOf: z.number().optional(),
})

export const GetDashboardWalletsRequest = z.object({
  timezone: z.string(),
})

export const GetDashboardWalletsResponse = z.array(
  WalletWithSpendingPeriodTotalSchema
)

export const GetTransactionRequestSchema = z.object({
  walletId: z.number(),
})

export const GetTransactionsResponseSchema = z.array(
  TransactionWithCurrencySchema
)

export const GetWalletsRequestSchema = z.object({
  searchPhrase: z.string().optional(),
  currency: z.string().length(3).optional(),
})

export const GetWalletsResponseSchema = z.array(WalletSchema)

export type CreateTransactionRequest = z.infer<
  typeof CreateTransactionRequestSchema
>
export type CreateWalletRequest = z.infer<typeof CreateWalletRequestSchema>
export type GetDashboardWalletsRequest = z.infer<
  typeof GetDashboardWalletsRequest
>
export type GetDashboardWalletsResponse = z.infer<
  typeof GetDashboardWalletsResponse
>
export type GetTransactionRequest = z.infer<typeof GetTransactionRequestSchema>
export type GetTransactionsResponse = z.infer<
  typeof GetTransactionsResponseSchema
>
export type GetWalletsRequest = z.infer<typeof GetWalletsRequestSchema>
export type GetWalletsResponse = z.infer<typeof GetWalletsResponseSchema>
export type Transaction = z.infer<typeof TransactionSchema>
export type Wallet = z.infer<typeof WalletSchema>
