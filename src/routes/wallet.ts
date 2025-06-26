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
  updateWallet,
} from '@/controllers/wallet'
import {
  CreateWalletRequestSchema,
  GetDashboardWalletsRequest,
  GetTransactionsRequestSchema,
  GetWalletChartDataRequestSchema,
  GetWalletsRequestSchema,
  GetWalletTransactionsRequestSchema,
  UpdateWalletRequestSchema,
} from '@/@types/shared'
import { WalletIdParamsSchema } from '@/@types/wallets'
import { getTransactionsByWalletId } from '@/controllers/transaction'

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
walletRoutes.put(
  '/:walletId',
  validateRequestParams(WalletIdParamsSchema),
  validateRequestBody(UpdateWalletRequestSchema),
  updateWallet
)
walletRoutes.get(
  '/:walletId/chart',
  validateRequestParams(WalletIdParamsSchema),
  validateRequestQuery(GetWalletChartDataRequestSchema),
  getWalletChartData
)
walletRoutes.get(
  '/:walletId/transaction',
  validateRequestParams(WalletIdParamsSchema),
  validateRequestQuery(GetWalletTransactionsRequestSchema),
  getTransactionsByWalletId
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
