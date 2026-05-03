import { Hono } from 'hono'
import { SubmissionController } from '../controllers/SubmissionController.js'
import { requireAuth } from '../middleware/auth.js'

const router = new Hono()

router.post('/labs/:labId/submit', requireAuth, SubmissionController.submit)

export default router
