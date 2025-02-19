import { Router } from 'express'
import { createWallet } from '@/controllers/wallet'

const walletRoutes = Router()

walletRoutes.post('/', createWallet)

export default walletRoutes
