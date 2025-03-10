import { type Request, type Response } from 'express'
import type {
  TypedRequestBody,
  TypedRequestParams,
  TypedRequestQuery,
} from 'zod-express-middleware'
import { CreateWalletRequestSchema } from '@/@types/shared'
import {
  GetDashboardWalletsRequest,
  GetWalletsRequestSchema,
} from '@/@types/shared'
import type { WalletIdParamsSchema } from '@/@types/wallets'
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

export const getWallet = async (
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

  // TODO: check of wallet belong to user

  const userWallets = await walletDAO.getWallet(walletIdInt)

  response.ok(res, userWallets)
}
