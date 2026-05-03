import { Hono } from 'hono'
import { CourseController } from '../controllers/CourseController.js'
import { requireAuth } from '../middleware/auth.js'

const router = new Hono()

router.get('/', CourseController.listCourses)
router.get('/:slug', CourseController.getCourse)
router.post('/:slug/enroll', requireAuth, CourseController.enroll)
router.get('/:slug/modules', CourseController.getModules)
router.get('/:slug/modules/:moduleSlug/labs', CourseController.getLaboratories)
router.get('/:slug/modules/:moduleSlug/labs/:labSlug', requireAuth, CourseController.getLaboratory)

export default router
