import { Category, SpendingPeriod } from '@/utils/enum'

export type RawWalletAndTransaction = {
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
} & {
  transactionId: number
  walletId: number
  amount: string
  category: Category
  description: string
  paidAt: string
  subscriptionId: number
  transactionUpdatedAt: string
  transactionCreatedAt: string
  transactionDeletedAt: string
}
