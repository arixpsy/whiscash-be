import { z } from 'zod'

export const TransactionIdParamsSchema = z.object({
  transactionId: z.string(),
})
