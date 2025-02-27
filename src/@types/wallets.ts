import { Category, SpendingPeriod } from '@/utils/enum'

export type RawWalletAndSpendingPeriodTotal = {
  id: number
  userId: string
  name: string
  currency: string
  country: string
  spendingPeriod: SpendingPeriod
  orderIndex: number
  archivedAt: string
  subWalletOf: number
  updatedAt: string
  createdAt: string
  deletedAt: string
  spendingPeriodTotal: string
}
