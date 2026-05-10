import type { Context } from 'hono'
import { AuthService } from '../services/AuthService.js'
import { UserDAO } from '../daos/UserDAO.js'

// In-memory reset tokens (key → {userId, expiresAt}). Resets on server restart.
// Configure email service to send the token link in production.
const resetTokens = new Map<string, { userId: string; expiresAt: number }>()

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

  static async forgotPassword(c: Context) {
    const { email } = await c.req.json()
    const user = await UserDAO.findByEmail(email)
    if (user) {
      const token = crypto.randomUUID()
      resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 3_600_000 })
      // TODO: send email with reset link. Token logged to console for development:
      console.log(`[RESET] ${email} → token: ${token}`)
    }
    // Always return same message to avoid email enumeration
    return c.json({ message: 'Si el correo está registrado, recibirás las instrucciones.' })
  }

  static async resetPassword(c: Context) {
    const { token, newPassword } = await c.req.json()
    if (!token) return c.json({ error: 'Token requerido.' }, 400)
    const entry = resetTokens.get(token)
    if (!entry || entry.expiresAt < Date.now()) {
      resetTokens.delete(token)
      return c.json({ error: 'El enlace es inválido o ha expirado.' }, 400)
    }
    if (!newPassword || newPassword.length < 8)
      return c.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, 400)
    const hash = await Bun.password.hash(newPassword)
    await UserDAO.updatePassword(entry.userId, hash)
    resetTokens.delete(token)
    return c.json({ message: 'Contraseña actualizada correctamente.' })
  }
}
