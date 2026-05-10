import { Hono } from 'hono'
import { CourseDAO } from '../daos/CourseDAO.js'

const router = new Hono()

router.get('/', async (c) => c.json(await CourseDAO.getPlatformStats()))

export default router
