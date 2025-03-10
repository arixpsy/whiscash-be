import { Router } from 'express'
import {
  validateRequestBody,
  validateRequestParams,
  validateRequestQuery,
} from 'zod-express-middleware'
import {
  createWallet,
  getAllWallets,
  getAllDashboardWallets,
  getAllMainWallets,
  getWallet,
} from '@/controllers/wallet'
import {
  CreateWalletRequestSchema,
  GetDashboardWalletsRequest,
  GetWalletsRequestSchema,
} from '@/@types/shared'
import { WalletIdParamsSchema } from '@/@types/wallets'

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
walletRoutes.get(
  '/:walletId',
  validateRequestParams(WalletIdParamsSchema),
  getWallet
)
walletRoutes.post(
  '/',
  validateRequestBody(CreateWalletRequestSchema),
  createWallet
)

export default walletRoutes
