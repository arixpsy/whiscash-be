import { z } from 'zod'
import { SpendingPeriod } from '@/utils/enum'

export const CreateWalletRequestSchema = z.object({
  name: z.string().min(1).max(50),
  currency: z.string().length(3),
  country: z.string().length(2),
  defaultSpendingPeriod: z.nativeEnum(SpendingPeriod),
  subWalletOf: z.number().optional(),
})

export const GetDashboardWalletsRequest = z.object({
  timezone: z.string(),
})

export const GetWalletsRequestSchema = z.object({
  searchPhrase: z.string().optional(),
  currency: z.string().length(3).optional(),
})
