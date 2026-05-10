import { Hono } from 'hono'
import { SubmissionController } from '../controllers/SubmissionController.js'
import { requireAuth } from '../middleware/auth.js'

const router = new Hono()

router.get('/labs/:labId/submissions', requireAuth, SubmissionController.getHistory)
router.post('/labs/:labId/submit', requireAuth, SubmissionController.submit)
router.post('/labs/:labId/check', requireAuth, SubmissionController.checkAnswer)

export default router
