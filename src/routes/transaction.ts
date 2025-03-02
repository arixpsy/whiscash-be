import { Router } from 'express'
import {
  validateRequestBody,
  validateRequestQuery,
} from 'zod-express-middleware'
import {
  CreateTransactionRequestSchema,
  GetTransactionRequestSchema,
} from '@/@types/shared'
import {
  createTransaction,
  getTransactionsByWalletId,
} from '@/controllers/transaction'

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

export default transactionRoutes
