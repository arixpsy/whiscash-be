import { Router } from 'express'
import transactionRoutes from '@/routes/transaction'
import walletRoutes from '@/routes/wallet'

const router = Router()

router.use('/wallet', walletRoutes)
router.use('/transaction', transactionRoutes)

export default router
