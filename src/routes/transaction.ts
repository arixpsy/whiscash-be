import { Router } from 'express'
import { createTransaction } from '@/controllers/transaction'

const transactionRoutes = Router()

transactionRoutes.post('/', createTransaction)

export default transactionRoutes
