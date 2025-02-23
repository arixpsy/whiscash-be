import { type Request, type Response } from 'express'
import type {
  TypedRequestBody,
  TypedRequestQuery,
} from 'zod-express-middleware'
import {
  CreateWalletRequestSchema,
  GetWalletsRequestSchema,
} from '@/@types/wallets'
import walletDAO from '@/dao/walletDAO'
import response from '@/utils/response'

export const createWallet = async (
  req: TypedRequestBody<typeof CreateWalletRequestSchema>,
  res: Response
) => {
  const { userId } = req.auth
  const { name, defaultSpendingPeriod, currency, country, subWalletOf } =
    req.body

  if (!userId) {
    response.unauthorized(res)
    return
  }

  const newWallet = await walletDAO.insertWallet({
    userId,
    name,
    currency,
    country,
    defaultSpendingPeriod,
    subWalletOf,
  })

  response.created(res, newWallet)
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
