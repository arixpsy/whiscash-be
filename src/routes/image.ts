import { Router } from 'express'
import { validateRequestBody } from 'zod-express-middleware'
import { GetImageTransactionDetailsRequestSchema } from '@/@types/shared'
import { handleReadImage } from '@/controllers/image'

const imageRouter = Router()

imageRouter.get(
  '/',
  validateRequestBody(GetImageTransactionDetailsRequestSchema),
  handleReadImage
)

export default imageRouter
