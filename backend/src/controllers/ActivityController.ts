import type { Context } from 'hono'
import { ActivityService } from '../services/ActivityService.js'
import type { TokenPayload } from '../types.js'

export class ActivityController {
  static async attempt(c: Context) {
    const user = c.get('user') as TokenPayload
    const { activityId } = c.req.param()
    const body = await c.req.json<Record<string, unknown>>()
    return c.json(await ActivityService.attempt(user.id, activityId, body))
  }
}
