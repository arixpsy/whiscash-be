import { type Response } from 'express'
import type {
  TypedRequestBody,
  TypedRequestParams,
  TypedRequestQuery,
} from 'zod-express-middleware'
import {
  CreateWalletRequestSchema,
  GetWalletChartDataRequestSchema,
} from '@/@types/shared'
import {
  GetDashboardWalletsRequest,
  GetWalletsRequestSchema,
} from '@/@types/shared'
import type { WalletIdParamsSchema } from '@/@types/wallets'
import settingsDAO from '@/dao/settingsDAO'
import walletDAO from '@/dao/walletDAO'
import response from '@/utils/response'
import transactionDAO from '@/dao/transactionDAO'

export const toggleArchiveWallet = async (
  req: TypedRequestParams<typeof WalletIdParamsSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { walletId } = req.params

  if (!userId) {
    response.unauthorized(res)
    return
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
      description: 'You do not have permission to archive this wallet',
    })
    return
  }

  const archivedAt = wallet.archivedAt

  let updatedWallet = undefined

  if (archivedAt) {
    updatedWallet = await walletDAO.archiveWallet(walletIdInt)
  } else {
    updatedWallet = await walletDAO.unarchiveWallet(walletIdInt)
  }

  response.ok(res, updatedWallet)
}

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

export const deleteWallet = async (
  req: TypedRequestParams<typeof WalletIdParamsSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { walletId } = req.params

  if (!userId) {
    response.unauthorized(res)
    return
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
      description: 'You do not have permission to delete this wallet',
    })
    return
  }

  const subWallets = await walletDAO.getWalletSubWallets(walletIdInt)

  if (subWallets.length > 0) {
    response.internalServerError(res, {
      message: 'Internal server error',
      description: 'You cannot delete a wallet with existing sub-wallets',
    })
    return
  }

  await transactionDAO.deleteTransactionsByWalletId(walletIdInt)

  const deletedWallet = await walletDAO.deleteWallet(walletIdInt)

  response.ok(res, deletedWallet)
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

  const dashboardWallets = await walletDAO.getAllDashboardWallets(
    userId,
    currentTimezone
  )

  response.ok(res, dashboardWallets)
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

export const getWalletById = async (
  req: TypedRequestParams<typeof WalletIdParamsSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { walletId } = req.params

  if (!userId) {
    response.unauthorized(res)
    return
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
      description: 'You do not have permission to view this wallet',
    })
    return
  }

  response.ok(res, wallet)
}

export const getWalletChartData = async (
  req: TypedRequestQuery<typeof GetWalletChartDataRequestSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { walletId } = req.params
  const { unit, limit, offset } = req.query

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
      description: 'You do not have permission to view this wallet',
    })
    return
  }

  const currentTimezone = await settingsDAO.getUserTimezone(userId)

  const chartData = await transactionDAO.getWalletChartData(
    walletIdInt,
    currentTimezone,
    unit,
    limit ? parseInt(limit) : 10,
    offset ? parseInt(offset) : 0
  )

  response.ok(res, chartData)
}
