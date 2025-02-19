import { Router } from 'express'
import { createWallet, getWallets } from '@/controllers/wallet'

const walletRoutes = Router()

walletRoutes.get('/', getWallets)
walletRoutes.post('/', createWallet)

export default walletRoutes
