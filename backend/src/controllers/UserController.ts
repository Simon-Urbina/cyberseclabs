import type { Context } from 'hono'
import { UserService } from '../services/UserService.js'
import type { TokenPayload } from '../types.js'

export class UserController {
  static async getMyProfile(c: Context) {
    const user = c.get('user') as TokenPayload
    return c.json(await UserService.getMyProfile(user.id))
  }

  static async updateProfile(c: Context) {
    const user = c.get('user') as TokenPayload
    const { bio } = await c.req.json()
    return c.json(await UserService.updateProfile(user.id, { bio }))
  }

  static async updateAvatar(c: Context) {
    const user = c.get('user') as TokenPayload
    const body = await c.req.parseBody()
    const file = body['avatar'] as File | undefined
    if (!file) return c.json({ error: 'No se envió ningún archivo con el campo "avatar".' }, 400)
    const buffer = Buffer.from(await file.arrayBuffer())
    await UserService.updateAvatar(user.id, { buffer, mimetype: file.type, size: file.size })
    return c.json({ message: 'Foto de perfil actualizada.' })
  }

  static async getPublicProfile(c: Context) {
    const { username } = c.req.param()
    return c.json(await UserService.getPublicProfile(username))
  }

  static async getRanking(c: Context) {
    const page = Math.max(1, Number(c.req.query('page') ?? 1))
    const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 20)))
    return c.json(await UserService.getRanking(page, limit))
  }
}
