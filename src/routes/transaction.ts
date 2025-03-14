import { Router } from 'express'
import {
  validateRequestBody,
  validateRequestParams,
  validateRequestQuery,
} from 'zod-express-middleware'
import {
  CreateTransactionRequestSchema,
  GetTransactionRequestSchema,
  UpdateTransactionRequestSchema,
} from '@/@types/shared'
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactionsByWalletId,
  updateTransaction,
} from '@/controllers/transaction'
import { TransactionIdParamsSchema } from '@/@types/transactions'

const transactionRoutes = Router()

transactionRoutes.get(
  '/',
  validateRequestQuery(GetTransactionRequestSchema),
  getTransactionsByWalletId
)
transactionRoutes.get(
  '/:transactionId',
  validateRequestParams(TransactionIdParamsSchema),
  getTransactionById
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
transactionRoutes.put(
  '/:transactionId',
  validateRequestParams(TransactionIdParamsSchema),
  validateRequestBody(UpdateTransactionRequestSchema),
  updateTransaction
)

export default transactionRoutes
