import { Router } from 'express'
import imageRoutes from '@/routes/image'
import transactionRoutes from '@/routes/transaction'
import walletRoutes from '@/routes/wallet'

const router = Router()

router.use('/wallet', walletRoutes)
router.use('/transaction', transactionRoutes)
router.use('/image', imageRoutes)

export default router
