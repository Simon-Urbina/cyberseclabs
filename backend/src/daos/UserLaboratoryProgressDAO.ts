import sql from '../db/index.js'
import type { UserLaboratoryProgress } from '../types.js'

export class UserLaboratoryProgressDAO {
  static async find(userId: string, laboratoryId: string): Promise<UserLaboratoryProgress | null> {
    const [row] = await sql<UserLaboratoryProgress[]>`
      SELECT * FROM user_laboratory_progress
      WHERE user_id = ${userId} AND laboratory_id = ${laboratoryId}
    `
    return row ?? null
  }

  static async findByUserId(userId: string): Promise<UserLaboratoryProgress[]> {
    return sql<UserLaboratoryProgress[]>`
      SELECT * FROM user_laboratory_progress WHERE user_id = ${userId}
    `
  }
}
