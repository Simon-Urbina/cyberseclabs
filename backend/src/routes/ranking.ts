import { Hono } from 'hono'
import { UserController } from '../controllers/UserController.js'

const router = new Hono()

router.get('/', UserController.getRanking)

export default router
