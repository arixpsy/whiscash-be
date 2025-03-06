import type { Response } from 'express'
import type {
  TypedRequestBody,
  TypedRequestParams,
  TypedRequestQuery,
} from 'zod-express-middleware'
import type {
  CreateTransactionRequestSchema,
  GetTransactionRequestSchema,
} from '@/@types/shared'
import type { TransactionIdParamsSchema } from '@/@types/transactions'
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

export const deleteTransaction = async (
  req: TypedRequestParams<typeof TransactionIdParamsSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { transactionId } = req.params

  if (!userId) {
    response.unauthorized(res)
    return
  }

  let transactionIdInt = 0

  try {
    transactionIdInt = parseInt(transactionId)
  } catch (e) {
    response.badRequest(res, {
      message: 'Bad request',
      description: 'Invalid transaction id',
    })
    return
  }

  // TODO: check of transaction/wallet belong to user

  const deletedTransaction =
    await transactionDAO.deleteTransaction(transactionIdInt)

  response.ok(res, deletedTransaction)
}

export const getTransactionsByWalletId = async (
  req: TypedRequestQuery<typeof GetTransactionRequestSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { walletId, limit, offset } = req.query

  if (!userId) {
    response.unauthorized(res)
    return
  }

  if (!walletId) {
    response.badRequest(res, {
      message: 'Bad request',
      description: 'Wallet id not specified',
    })
  }

  // TODO: check walletId belong to userId

  const walletTransactions = await transactionDAO.getTransactionsByWalletId(
    parseInt(walletId),
    limit ? parseInt(limit) : 10,
    offset ? parseInt(offset) : 0
  )

  response.ok(res, walletTransactions)
}
