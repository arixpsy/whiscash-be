import { z } from 'zod'
import type { Transaction } from './shared'

export const TransactionIdParamsSchema = z.object({
  transactionId: z.string(),
})

export type RawWalletChartData = {
  startPeriod: string
  spendingPeriodTotal: number
  transactions: Array<Transaction>
}
