import { Router } from 'express'
import {
  validateRequestBody,
  validateRequestParams,
  validateRequestQuery,
} from 'zod-express-middleware'
import {
  CreateTransactionRequestSchema,
  GetTransactionRequestSchema,
} from '@/@types/shared'
import {
  createTransaction,
  deleteTransaction,
  getTransactionsByWalletId,
} from '@/controllers/transaction'
import { TransactionIdParamsSchema } from '@/@types/transactions'

const transactionRoutes = Router()

transactionRoutes.get(
  '/',
  validateRequestQuery(GetTransactionRequestSchema),
  getTransactionsByWalletId
)
transactionRoutes.post(
  '/',
  validateRequestBody(CreateTransactionRequestSchema),
  createTransaction
)
transactionRoutes.delete(
  '/:transactionId',
  validateRequestParams(TransactionIdParamsSchema),
  deleteTransaction
)

export default transactionRoutes
