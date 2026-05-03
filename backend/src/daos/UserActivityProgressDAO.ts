import sql from '../db/index.js'
import type { UserActivityProgress } from '../types.js'

export class UserActivityProgressDAO {
  static async find(userId: string, activityId: string): Promise<UserActivityProgress | null> {
    const [row] = await sql<UserActivityProgress[]>`
      SELECT * FROM user_activity_progress
      WHERE user_id = ${userId} AND activity_id = ${activityId}
    `
    return row ?? null
  }
}
