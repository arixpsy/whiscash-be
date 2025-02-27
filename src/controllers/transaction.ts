import type { Request, Response } from 'express'
import type { TypedRequestQuery } from 'zod-express-middleware'
import type { GetTransactionRequestSchema } from '@/@types/shared'
import transactionDAO from '@/dao/transactionDAO'
import response from '@/utils/response'

export const createTransaction = (req: Request, res: Response) => {
  res.status(200).json({
    message: 'transaction created',
  })
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
