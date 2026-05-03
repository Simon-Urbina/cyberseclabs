import sql from '../db/index.js'
import type { LaboratoryQuestionOption } from '../types.js'

export class LaboratoryQuestionOptionDAO {
  static async findByQuestionId(questionId: string): Promise<LaboratoryQuestionOption[]> {
    return sql<LaboratoryQuestionOption[]>`
      SELECT * FROM laboratory_question_options
      WHERE question_id = ${questionId}
      ORDER BY option_order ASC
    `
  }

  static async findCorrectByQuestionId(questionId: string): Promise<LaboratoryQuestionOption | null> {
    const [row] = await sql<LaboratoryQuestionOption[]>`
      SELECT * FROM laboratory_question_options
      WHERE question_id = ${questionId} AND is_correct = TRUE
    `
    return row ?? null
  }

  static async findById(id: string): Promise<LaboratoryQuestionOption | null> {
    const [row] = await sql<LaboratoryQuestionOption[]>`
      SELECT * FROM laboratory_question_options WHERE id = ${id}
    `
    return row ?? null
  }

  static async create(data: {
    questionId: string
    optionOrder: number
    optionText: string
    isCorrect: boolean
  }): Promise<LaboratoryQuestionOption> {
    const [row] = await sql<LaboratoryQuestionOption[]>`
      INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
      VALUES (${data.questionId}, ${data.optionOrder}, ${data.optionText}, ${data.isCorrect})
      RETURNING *
    `
    return row
  }
}
