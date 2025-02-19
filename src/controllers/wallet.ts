import type { Request, Response } from 'express'

export const createWallet = (req: Request, res: Response) => {
  console.log(req)

  res.status(200).json({
    message: 'wallet created',
  })
}

export const getWallets = (req: Request, res: Response) => {
  console.log(req)

  res.status(200).json({
    message: 'get wallet',
  })
}
