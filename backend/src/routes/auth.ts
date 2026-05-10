import { Hono } from 'hono'
import { AuthController } from '../controllers/AuthController.js'
import { requireAuth } from '../middleware/auth.js'

const router = new Hono()

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/logout', requireAuth, AuthController.logout)
router.post('/forgot-password', AuthController.forgotPassword)
router.post('/reset-password', AuthController.resetPassword)

export default router
