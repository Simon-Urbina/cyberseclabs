import { Hono } from 'hono'
import { ActivityController } from '../controllers/ActivityController.js'
import { requireAuth } from '../middleware/auth.js'

const router = new Hono()

router.post('/:activityId/attempt', requireAuth, ActivityController.attempt)

export default router
