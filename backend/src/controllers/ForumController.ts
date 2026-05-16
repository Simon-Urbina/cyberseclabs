import type { Context } from 'hono'
import { ForumService } from '../services/ForumService.js'
import type { TokenPayload } from '../types.js'

export class ForumController {
  static async listRoots(c: Context) {
    const page = Number(c.req.query('page') ?? '1')
    return c.json(await ForumService.listRoots(page))
  }

  static async listReplies(c: Context) {
    const { id } = c.req.param()
    return c.json(await ForumService.listReplies(id))
  }

  static async createComment(c: Context) {
    const user = c.get('user') as TokenPayload
    const { content } = await c.req.json<{ content: string }>()
    return c.json(await ForumService.createComment(user.id, content), 201)
  }

  static async createReply(c: Context) {
    const user = c.get('user') as TokenPayload
    const { id } = c.req.param()
    const { content } = await c.req.json<{ content: string }>()
    return c.json(await ForumService.createReply(user.id, id, content), 201)
  }

  static async deleteComment(c: Context) {
    const user = c.get('user') as TokenPayload
    const { id } = c.req.param()
    await ForumService.deleteComment(id, user.id, user.role)
    return c.json({ ok: true })
  }
}
