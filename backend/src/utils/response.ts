import { createHmac } from 'crypto'

/**
 * Generates a unique, deterministic response code per user+activity pair.
 * The same user always gets the same code for the same activity.
 * Different users get different codes.
 */
export function generateActivityResponse(userId: string, activityId: string): string {
  const secret = process.env.JWT_SECRET ?? 'fallback-secret'
  return createHmac('sha256', secret)
    .update(`activity:${userId}:${activityId}`)
    .digest('hex')
    .slice(0, 16)
    .toUpperCase()
}
