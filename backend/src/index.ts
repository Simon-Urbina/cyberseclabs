import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { HTTPError } from './utils/errors.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import courseRoutes from './routes/courses.js'
import activityRoutes from './routes/activities.js'
import submissionRoutes from './routes/submissions.js'
import rankingRoutes from './routes/ranking.js'
import adminRoutes from './routes/admin.js'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.route('/api/auth', authRoutes)
app.route('/api/users', userRoutes)
app.route('/api/courses', courseRoutes)
app.route('/api/activities', activityRoutes)
app.route('/api', submissionRoutes)          // → /api/labs/:labId/submit
app.route('/api/ranking', rankingRoutes)
app.route('/api/admin', adminRoutes)

app.get('/health', (c) => c.json({ status: 'ok' }))

app.onError((err, c) => {
  const httpErr = err as HTTPError
  if (typeof httpErr.status === 'number') {
    return c.json({ error: err.message }, httpErr.status as 400)
  }
  console.error(err)
  return c.json({ error: 'Error interno del servidor.' }, 500)
})

app.notFound((c) => c.json({ error: 'Ruta no encontrada.' }, 404))

export default {
  port: Number(process.env.PORT ?? 3000),
  fetch: app.fetch,
}
