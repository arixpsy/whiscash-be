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
  getWalletById,
  getWalletChartData,
  deleteWallet,
  toggleArchiveWallet,
} from '@/controllers/wallet'
import {
  CreateWalletRequestSchema,
  GetDashboardWalletsRequest,
  GetWalletChartDataRequestSchema,
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
  getWalletById
)
walletRoutes.delete(
  '/:walletId',
  validateRequestParams(WalletIdParamsSchema),
  deleteWallet
)
walletRoutes.get(
  '/:walletId/chart',
  validateRequestParams(WalletIdParamsSchema),
  validateRequestQuery(GetWalletChartDataRequestSchema),
  getWalletChartData
)
walletRoutes.put(
  '/:walletId/archive',
  validateRequestParams(WalletIdParamsSchema),
  toggleArchiveWallet
)
walletRoutes.post(
  '/',
  validateRequestBody(CreateWalletRequestSchema),
  createWallet
)

export default walletRoutes
