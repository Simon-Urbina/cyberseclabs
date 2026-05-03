import sql from '../db/index.js'
import type { QuestionActivity } from '../types.js'

export class QuestionActivityDAO {
  static async findByQuestionId(questionId: string): Promise<QuestionActivity | null> {
    const [row] = await sql<QuestionActivity[]>`
      SELECT * FROM question_activities WHERE question_id = ${questionId}
    `
    return row ?? null
  }

  static async findById(id: string): Promise<QuestionActivity | null> {
    const [row] = await sql<QuestionActivity[]>`
      SELECT * FROM question_activities WHERE id = ${id}
    `
    return row ?? null
  }

  static async create(data: {
    questionId: string
    title: string
    instructionsMarkdown: string
    expectedActionKey: string
    successFeedback?: string
  }): Promise<QuestionActivity> {
    const [row] = await sql<QuestionActivity[]>`
      INSERT INTO question_activities
        (question_id, title, instructions_markdown, expected_action_key, success_feedback)
      VALUES (
        ${data.questionId}, ${data.title}, ${data.instructionsMarkdown},
        ${data.expectedActionKey},
        ${data.successFeedback ?? 'Accion correcta. Usa esta respuesta en el quiz.'}
      )
      RETURNING *
    `
    return row
  }

  static async update(
    id: string,
    data: Partial<Pick<QuestionActivity, 'title' | 'instructionsMarkdown' | 'expectedActionKey' | 'successFeedback' | 'isPublished'>>,
  ): Promise<QuestionActivity | null> {
    const [row] = await sql<QuestionActivity[]>`
      UPDATE question_activities SET
        title                 = COALESCE(${data.title ?? null}, title),
        instructions_markdown = COALESCE(${data.instructionsMarkdown ?? null}, instructions_markdown),
        expected_action_key   = COALESCE(${data.expectedActionKey ?? null}, expected_action_key),
        success_feedback      = COALESCE(${data.successFeedback ?? null}, success_feedback),
        is_published          = COALESCE(${data.isPublished ?? null}, is_published)
      WHERE id = ${id}
      RETURNING *
    `
    return row ?? null
  }
}
