import sql from '../db/index.js'
import type { ActivityActionLog } from '../types.js'

export class ActivityActionLogDAO {
  static async create(data: {
    userId: string
    activityId: string
    actionPayload: Record<string, unknown>
    isCorrect: boolean
    feedback?: string | null
    generatedResponse?: string | null
  }): Promise<ActivityActionLog> {
    const [row] = await sql<ActivityActionLog[]>`
      INSERT INTO activity_action_logs
        (user_id, activity_id, action_payload, is_correct, feedback, generated_response)
      VALUES (
        ${data.userId}, ${data.activityId}, ${sql.json(data.actionPayload)},
        ${data.isCorrect}, ${data.feedback ?? null}, ${data.generatedResponse ?? null}
      )
      RETURNING *
    `
    return row
  }
}
