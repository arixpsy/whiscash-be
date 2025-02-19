import type { NextFunction, Request, Response } from 'express'

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  next()
}

export default authenticate
