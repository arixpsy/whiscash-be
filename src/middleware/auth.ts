import { authenticateRequest } from '@clerk/express'
import type { NextFunction, Request, Response as Res } from 'express'
import clerkClient from '@/utils/clerk'
import response from '@/utils/response'

const authenticate = async (req: Request, res: Res, next: NextFunction) => {
  const requestState = await authenticateRequest({
    clerkClient,
    request: req,
  })

  if (!requestState.isSignedIn) {
    response.unauthorized(res)
    next(new Error('User is not authenticated'))
  }

  const auth = requestState.toAuth()

  Object.assign(req, { auth })

  next()
}

export default authenticate
