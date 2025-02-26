import { Router } from 'express'
import {
  validateRequestBody,
  validateRequestQuery,
} from 'zod-express-middleware'
import {
  createWallet,
  getAllWallets,
  getAllDashboardWallets,
  getAllMainWallets,
} from '@/controllers/wallet'
import {
  CreateWalletRequestSchema,
  GetDashboardWalletsRequest,
  GetWalletsRequestSchema,
} from '@/@types/shared'

const walletRoutes = Router()

walletRoutes.get(
  '/',
  validateRequestQuery(GetWalletsRequestSchema),
  getAllWallets
)
walletRoutes.get(
  '/dashboard',
  validateRequestQuery(GetDashboardWalletsRequest),
  getAllDashboardWallets
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
