import { Category, SpendingPeriod } from '@/utils/enum'
import { z } from 'zod'

const TransactionSchema = z.object({
  id: z.number(),
  walletId: z.number(),
  amount: z.number(),
  category: z.nativeEnum(Category),
  description: z.string(),
  paidAt: z.string(),
  subscriptionId: z.number().nullable(),
  updatedAt: z.string().nullable(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
})

const TransactionWithWalletSchema = TransactionSchema.merge(
  z.object({
    currency: z.string(),
    country: z.string(),
    name: z.string(),
    subWalletOf: z.number().nullable(),
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
    spendingPeriodTotal: z.number(),
  })
)

export const CreateTransactionRequestSchema = z.object({
  walletId: z.number(),
  amount: z.number(),
  category: z.nativeEnum(Category),
  description: z.string().min(1),
  paidAt: z.string().optional(),
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

export const GetImageTransactionDetailsResponseSchema =
  CreateTransactionRequestSchema.pick({
    amount: true,
    category: true,
    description: true,
    paidAt: true,
  }).partial()

// Values are string typed due to search params
export const GetTransactionsRequestSchema = z.object({
  limit: z.string(),
  offset: z.string().optional(),
  date: z.string().optional(),
})

export const GetWalletTransactionsRequestSchema =
  GetTransactionsRequestSchema.merge(
    z.object({
      walletId: z.string(),
    })
  )

export const GetTransactionsResponseSchema = z.array(
  TransactionWithWalletSchema
)

export const GetWalletChartDataRequestSchema = z.object({
  unit: z.nativeEnum(SpendingPeriod),
  limit: z.string(),
  offset: z.string().optional(),
})

export const GetWalletChartDataResponseSchema = z.array(
  z.object({
    startPeriod: z.string(),
    spendingPeriodTotal: z.number(),
    transactions: z.array(TransactionSchema).nullable(),
  })
)
export const GetWalletsRequestSchema = z.object({
  searchPhrase: z.string().optional(),
  currency: z.string().length(3).optional(),
  type: z.string().optional(),
})

export const GetWalletsResponseSchema = z.array(WalletSchema)

export const UpdateTransactionRequestSchema =
  CreateTransactionRequestSchema.merge(z.object({ id: z.number() }))

export const UpdateWalletRequestSchema = CreateWalletRequestSchema.omit({
  currency: true,
  country: true,
}).merge(z.object({ id: z.number() }))

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
export type GetImageTransactionDetailsResponse = z.infer<
  typeof GetImageTransactionDetailsResponseSchema
>
export type GetTransactionsRequest = z.infer<
  typeof GetTransactionsRequestSchema
>
export type GetWalletTransactionsRequest = z.infer<
  typeof GetWalletTransactionsRequestSchema
>
export type GetTransactionsResponse = z.infer<
  typeof GetTransactionsResponseSchema
>
export type GetWalletChartDataRequest = z.infer<
  typeof GetWalletChartDataRequestSchema
>
export type GetWalletChartDataResponse = z.infer<
  typeof GetWalletChartDataResponseSchema
>
export type GetWalletsRequest = z.infer<typeof GetWalletsRequestSchema>
export type GetWalletsResponse = z.infer<typeof GetWalletsResponseSchema>
export type Transaction = z.infer<typeof TransactionSchema>
export type TransactionWithWallet = z.infer<typeof TransactionWithWalletSchema>
export type UpdateTransactionRequest = z.infer<
  typeof UpdateTransactionRequestSchema
>
export type UpdateWalletRequest = z.infer<typeof UpdateWalletRequestSchema>
export type Wallet = z.infer<typeof WalletSchema>
export type WalletWithSpendingPeriodTotal = z.infer<
  typeof WalletWithSpendingPeriodTotalSchema
>
