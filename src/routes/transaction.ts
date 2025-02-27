import { Router } from 'express'
import {
  createTransaction,
  getTransactionsByWalletId,
} from '@/controllers/transaction'
import { validateRequestQuery } from 'zod-express-middleware'
import { GetTransactionRequestSchema } from '@/@types/shared'

const transactionRoutes = Router()

transactionRoutes.get(
  '/',
  validateRequestQuery(GetTransactionRequestSchema),
  getTransactionsByWalletId
)
transactionRoutes.post('/', createTransaction)

export default transactionRoutes
