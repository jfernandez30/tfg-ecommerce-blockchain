import { Router } from 'express'
import { createOrder, getMyOrders, getOrder } from '../controllers/order.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.post('/', authenticateToken, createOrder)
router.get('/my', authenticateToken, getMyOrders)
router.get('/:id', authenticateToken, getOrder)

export default router
