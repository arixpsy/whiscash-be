import { type Request, type Response } from 'express'
import walletDAO from '@/dao/walletDAO'
import response from '@/utils/response'

export const createWallet = async (req: Request, res: Response) => {
  const { userId } = req.auth
  const { name, defaultSpendingPeriod, currency } = req.body

  if (!userId) {
    response.unauthorized(res)
    return
  }

  const newWallet = await walletDAO.insertWallet({
    userId,
    name,
    currency,
    defaultSpendingPeriod,
  })

  response.created(res, newWallet)
}

export const getWallets = async (req: Request, res: Response) => {
  const { userId } = req.auth

  if (!userId) {
    response.unauthorized(res)
    return
  }

  const userWallets = await walletDAO.getWallets(userId)

  response.ok(res, userWallets)
}
