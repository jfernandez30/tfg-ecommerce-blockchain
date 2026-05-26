import { Router } from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth'
import {
  getAllOrders,
  updateOrderStatus,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/admin.controller'

const router = Router()

router.use(authenticateToken, requireAdmin)

router.get('/orders', getAllOrders)
router.put('/orders/:id/status', updateOrderStatus)

router.get('/products', getAllProducts)
router.post('/products', createProduct)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)

router.get('/categories', getAllCategories)
router.post('/categories', createCategory)
router.put('/categories/:id', updateCategory)
router.delete('/categories/:id', deleteCategory)

export default router
