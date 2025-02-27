import { type Request, type Response } from 'express'
import type {
  TypedRequestBody,
  TypedRequestQuery,
} from 'zod-express-middleware'
import { CreateWalletRequestSchema } from '@/@types/shared'
import {
  GetDashboardWalletsRequest,
  GetWalletsRequestSchema,
  type GetDashboardWalletsResponse,
} from '@/@types/shared'
import settingsDAO from '@/dao/settingsDAO'
import walletDAO from '@/dao/walletDAO'
import response from '@/utils/response'

export const createWallet = async (
  req: TypedRequestBody<typeof CreateWalletRequestSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { name, spendingPeriod, currency, country, subWalletOf } = req.body

  if (!userId) {
    response.unauthorized(res)
    return
  }

  const newWallet = await walletDAO.insertWallet({
    userId,
    name,
    currency,
    country,
    spendingPeriod,
    subWalletOf,
  })

  response.created(res, newWallet)
}

export const getAllDashboardWallets = async (
  req: TypedRequestQuery<typeof GetDashboardWalletsRequest>,
  res: Response
) => {
  const { userId } = req.auth
  const { timezone } = req.query

  if (!userId) {
    response.unauthorized(res)
    return
  }

  const currentTimezone = await settingsDAO.getUserTimezoneAndCreateIfNull(
    userId,
    timezone
  )

  const walletsAndTransactions = await walletDAO.getAllDashboardWallets(
    userId,
    currentTimezone
  )

  const responseBody: GetDashboardWalletsResponse = []
  const transactionsByWalletId = Object.groupBy(
    walletsAndTransactions,
    ({ id }) => id
  )

  for (const transactions of Object.values(transactionsByWalletId)) {
    if (!transactions) continue

    let spendingPeriodTotal = 0
    const walletTransactions = []

    for (const transaction of transactions) {
      if (transaction.transactionId === null) break

      spendingPeriodTotal += parseFloat(transaction.amount)

      walletTransactions.push({
        id: transaction.transactionId,
        walletId: transaction.walletId,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        paidAt: transaction.paidAt,
        subscriptionId: transaction.subscriptionId,
        updatedAt: transaction.transactionUpdatedAt,
        createdAt: transaction.transactionCreatedAt,
        deletedAt: transaction.transactionDeletedAt,
      })
    }

    responseBody.push({
      id: transactions[0].id,
      userId: transactions[0].userId,
      name: transactions[0].name,
      currency: transactions[0].currency,
      country: transactions[0].country,
      spendingPeriod: transactions[0].spendingPeriod,
      orderIndex: transactions[0].orderIndex,
      archivedAt: transactions[0].archivedAt,
      subWalletOf: transactions[0].subWalletOf,
      updatedAt: transactions[0].updatedAt,
      createdAt: transactions[0].createdAt,
      deletedAt: transactions[0].deletedAt,
      spendingPeriodTotal,
      transactions: walletTransactions,
    })
  }

  response.ok(res, responseBody)
}

export const getAllMainWallets = async (
  req: TypedRequestQuery<typeof GetWalletsRequestSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { searchPhrase, currency } = req.query

  if (!userId) {
    response.unauthorized(res)
    return
  }

  const userWallets = await walletDAO.getAllMainWallets(userId, {
    currency,
    searchPhrase,
  })

  response.ok(res, userWallets)
}

export const getAllWallets = async (
  req: TypedRequestQuery<typeof GetWalletsRequestSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { searchPhrase } = req.query

  if (!userId) {
    response.unauthorized(res)
    return
  }

  const userWallets = await walletDAO.getAllWallets(userId, { searchPhrase })

  response.ok(res, userWallets)
}
