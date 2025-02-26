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
  WalletSchema.merge(
    z.object({
      transactions: z.array(TransactionSchema),
    })
  )
)

export const GetWalletsRequestSchema = z.object({
  searchPhrase: z.string().optional(),
  currency: z.string().length(3).optional(),
})

export const GetWalletsResponseSchema = z.array(WalletSchema)

export type CreateWalletRequest = z.infer<typeof CreateWalletRequestSchema>
export type GetDashboardWalletsRequest = z.infer<
  typeof GetDashboardWalletsRequest
>
export type GetDashboardWalletsResponse = z.infer<
  typeof GetDashboardWalletsResponse
>
export type GetWalletsRequest = z.infer<typeof GetWalletsRequestSchema>
export type GetWalletsResponse = z.infer<typeof GetWalletsResponseSchema>
export type Wallet = z.infer<typeof WalletSchema>
