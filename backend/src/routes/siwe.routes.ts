import { Router } from 'express'
import { getNonce, verifySiwe } from '../controllers/siwe.controller'

const router = Router()

router.get('/nonce', getNonce)
router.post('/verify', verifySiwe)

export default router
