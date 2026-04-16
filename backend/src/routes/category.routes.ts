import { Router } from 'express'
import { getCategories, createCategory } from '../controllers/category.controller'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = Router()

router.get('/', getCategories)
router.post('/', authenticateToken, requireAdmin, createCategory)

export default router
