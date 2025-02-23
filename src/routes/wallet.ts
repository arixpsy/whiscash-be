import { Router } from 'express'
import {
  validateRequestBody,
  validateRequestQuery,
} from 'zod-express-middleware'
import {
  createWallet,
  getAllWallets,
  getAllMainWallets,
} from '@/controllers/wallet'
import {
  CreateWalletRequestSchema,
  GetWalletsRequestSchema,
} from '@/@types/wallets'

const walletRoutes = Router()

walletRoutes.get(
  '/',
  validateRequestQuery(GetWalletsRequestSchema),
  getAllWallets
)
walletRoutes.get(
  '/main',
  validateRequestQuery(GetWalletsRequestSchema),
  getAllMainWallets
)
walletRoutes.post(
  '/',
  validateRequestBody(CreateWalletRequestSchema),
  createWallet
)

export default walletRoutes
