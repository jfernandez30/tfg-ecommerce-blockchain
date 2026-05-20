import { Router } from 'express'
import { createOrder, getMyOrders, getOrder, updateBlockchainStatus } from '../controllers/order.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.post('/', authenticateToken, createOrder)
router.get('/my', authenticateToken, getMyOrders)
router.get('/:id', authenticateToken, getOrder)
router.put('/:id/blockchain', authenticateToken, updateBlockchainStatus)

export default router
