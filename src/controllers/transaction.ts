import type { Request, Response } from 'express'

export const createTransaction = (req: Request, res: Response) => {
  res.status(200).json({
    message: 'transaction created',
  })
}
