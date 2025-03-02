import type { Response } from 'express'
import type {
  TypedRequestBody,
  TypedRequestQuery,
} from 'zod-express-middleware'
import type {
  CreateTransactionRequestSchema,
  GetTransactionRequestSchema,
} from '@/@types/shared'
import transactionDAO from '@/dao/transactionDAO'
import response from '@/utils/response'

export const createTransaction = async (
  req: TypedRequestBody<typeof CreateTransactionRequestSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { amount, category, description, walletId } = req.body

  if (!userId) {
    response.unauthorized(res)
    return
  }

  // TODO: check walletId belong to userId

  const newTransaction = await transactionDAO.insertTransaction({
    amount,
    category,
    description,
    walletId,
  })

  response.created(res, newTransaction)
}

export const getTransactionsByWalletId = async (
  req: TypedRequestQuery<typeof GetTransactionRequestSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { walletId } = req.query

  if (!userId) {
    response.unauthorized(res)
    return
  }

  // TODO: check walletId belong to userId

  const walletTransactions = await transactionDAO.getTransactionsByWalletId(
    parseInt(walletId as unknown as string)
  )

  response.ok(res, walletTransactions)
}
