import { Hono } from 'hono'
import { ForumController } from '../controllers/ForumController.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'

const router = new Hono()

router.get('/',             optionalAuth, ForumController.listRoots)
router.get('/:id/replies',  optionalAuth, ForumController.listReplies)
router.post('/',            requireAuth,  ForumController.createComment)
router.post('/:id/replies', requireAuth,  ForumController.createReply)
router.delete('/:id',       requireAuth,  ForumController.deleteComment)

export default router
