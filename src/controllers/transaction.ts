import type { Response } from 'express'
import { DateTime } from 'luxon'
import type {
  TypedRequestBody,
  TypedRequestParams,
  TypedRequestQuery,
} from 'zod-express-middleware'
import type {
  CreateTransactionRequestSchema,
  GetTransactionsRequestSchema,
  GetWalletTransactionsRequestSchema,
  UpdateTransactionRequestSchema,
} from '@/@types/shared'
import type { TransactionIdParamsSchema } from '@/@types/transactions'
import transactionDAO from '@/dao/transactionDAO'
import walletDAO from '@/dao/walletDAO'
import response from '@/utils/response'

export const createTransaction = async (
  req: TypedRequestBody<typeof CreateTransactionRequestSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { amount, category, description, walletId, paidAt } = req.body

  if (!userId) {
    response.unauthorized(res)
    return
  }

  const wallet = await walletDAO.getWallet(walletId)

  if (!wallet || wallet.userId !== userId) {
    response.forbidden(res, {
      message: 'Forbidden',
      description:
        'You do not have permission to add transactions to this wallet',
    })
    return
  }

  const newTransaction = await transactionDAO.insertTransaction({
    amount,
    category,
    description: description.trim(),
    walletId,
    paidAt,
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

  const transaction = await transactionDAO.getTransactionById(transactionIdInt)

  if (!transaction) {
    response.notFound(res, {
      message: 'Not found',
      description: 'Transaction not found',
    })
    return
  }

  const wallet = await walletDAO.getWallet(transaction.walletId)

  if (!wallet || wallet.userId !== userId) {
    response.forbidden(res, {
      message: 'Forbidden',
      description: 'You do not have permission to delete this transaction',
    })
    return
  }

  const deletedTransaction =
    await transactionDAO.deleteTransaction(transactionIdInt)

  response.ok(res, deletedTransaction)
}

export const getAllTransactions = async (
  req: TypedRequestQuery<typeof GetTransactionsRequestSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { limit, offset, date = DateTime.now().toISODate() } = req.query

  if (!userId) {
    response.unauthorized(res)
    return
  }

  const parseDate = DateTime.fromISO(date)

  if (!parseDate.isValid) {
    response.badRequest(res, {
      message: 'Bad request',
      description: 'Invalid date value',
    })
    return
  }

  const allWallets = await walletDAO.getAllWallets(userId, {})

  const transactions = await transactionDAO.getTransactionsByDate(
    allWallets.map((wallet) => wallet.id),
    parseDate,
    limit ? parseInt(limit) : 10,
    offset ? parseInt(offset) : 0
  )

  response.ok(res, transactions)
}

export const getTransactionsByWalletId = async (
  req: TypedRequestQuery<typeof GetWalletTransactionsRequestSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { walletId } = req.params
  const { limit, offset } = req.query

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

  let walletIdInt = 0

  try {
    walletIdInt = parseInt(walletId)
  } catch (e) {
    response.badRequest(res, {
      message: 'Bad request',
      description: 'Invalid wallet id',
    })
    return
  }

  const wallet = await walletDAO.getWallet(walletIdInt)

  if (!wallet || wallet.userId !== userId) {
    response.forbidden(res, {
      message: 'Forbidden',
      description:
        'You do not have permission to view transactions of this wallet',
    })
    return
  }

  const walletTransactions = await transactionDAO.getTransactionsByWalletId(
    parseInt(walletId),
    limit ? parseInt(limit) : 10,
    offset ? parseInt(offset) : 0
  )

  response.ok(res, walletTransactions)
}

export const getTransactionById = async (
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

  const transaction = await transactionDAO.getTransactionById(transactionIdInt)

  if (!transaction) {
    response.notFound(res, {
      message: 'Not found',
      description: 'Transaction not found',
    })
    return
  }

  response.ok(res, transaction)
}

export const updateTransaction = async (
  req: TypedRequestBody<typeof UpdateTransactionRequestSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { transactionId } = req.params
  const { amount, category, description, walletId, paidAt } = req.body

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

  const transaction = await transactionDAO.getTransactionById(transactionIdInt)

  if (!transaction) {
    response.notFound(res, {
      message: 'Not found',
      description: 'Transaction not found',
    })
    return
  }

  const wallet = await walletDAO.getWallet(transaction.walletId)

  if (!wallet || wallet.userId !== userId) {
    response.forbidden(res, {
      message: 'Forbidden',
      description: 'You do not have permission to update this transaction',
    })
    return
  }

  if (walletId !== wallet.id) {
    const newWallet = await walletDAO.getWallet(walletId)

    if (!newWallet || newWallet.userId !== userId) {
      response.forbidden(res, {
        message: 'Forbidden',
        description:
          'You do not have permission to add transactions to this wallet',
      })
      return
    }
  }

  const updatedTransaction = await transactionDAO.updateTransaction(
    transaction.id,
    {
      amount,
      category,
      description: description.trim(),
      walletId,
      paidAt,
    }
  )

  response.ok(res, updatedTransaction)
}
