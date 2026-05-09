import type { MiddlewareHandler } from 'hono'
import { verify } from 'jsonwebtoken'
import type { TokenPayload } from '../types.js'
import { HTTPError } from '../utils/errors.js'

function getSecret(): string {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET is required')
  return s
}

function extractToken(c: Parameters<MiddlewareHandler>[0]): string {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) throw new HTTPError(401, 'No autorizado.')
  return auth.slice(7)
}

export const optionalAuth: MiddlewareHandler = async (c, next) => {
  const auth = c.req.header('Authorization')
  if (auth?.startsWith('Bearer ')) {
    try {
      const payload = verify(auth.slice(7), getSecret()) as TokenPayload
      c.set('user', payload)
    } catch {
      // ignore invalid tokens — endpoint is reachable without auth
    }
  }
  await next()
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  try {
    const payload = verify(extractToken(c), getSecret()) as TokenPayload
    c.set('user', payload)
  } catch (e) {
    if (e instanceof HTTPError) throw e
    throw new HTTPError(401, 'Token inválido o expirado.')
  }
  await next()
}

export const requireAdmin: MiddlewareHandler = async (c, next) => {
  try {
    const payload = verify(extractToken(c), getSecret()) as TokenPayload
    if (payload.role !== 'admin') throw new HTTPError(403, 'Acceso denegado.')
    c.set('user', payload)
  } catch (e) {
    if (e instanceof HTTPError) throw e
    throw new HTTPError(401, 'Token inválido o expirado.')
  }
  await next()
}
