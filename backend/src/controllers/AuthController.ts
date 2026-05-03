import type { Context } from 'hono'
import { AuthService } from '../services/AuthService.js'

export class AuthController {
  static async register(c: Context) {
    const { username, email, password } = await c.req.json()
    const { user, token } = await AuthService.register(username, email, password)
    return c.json(
      { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } },
      201,
    )
  }

  static async login(c: Context) {
    const { email, password } = await c.req.json()
    const { user, token } = await AuthService.login(email, password)
    return c.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } })
  }

  static logout(c: Context) {
    return c.json({ message: 'Sesión cerrada.' })
  }
}
