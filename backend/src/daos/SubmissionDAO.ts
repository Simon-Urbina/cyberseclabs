import sql from '../db/index.js'
import type { Submission, SubmissionAnswer } from '../types.js'

export class SubmissionDAO {
  static async create(data: {
    userId: string
    laboratoryId: string
    attemptNumber: number
    answers: SubmissionAnswer[]
    answeredQuestionsCount: number
    correctAnswersCount: number
    scorePercent: number
  }): Promise<Submission> {
    const [row] = await sql<Submission[]>`
      INSERT INTO submissions
        (user_id, laboratory_id, attempt_number, answers,
         answered_questions_count, correct_answers_count, score_percent)
      VALUES (
        ${data.userId}, ${data.laboratoryId}, ${data.attemptNumber},
        ${sql.json(data.answers as never)}, ${data.answeredQuestionsCount},
        ${data.correctAnswersCount}, ${data.scorePercent}
      )
      RETURNING *
    `
    return row
  }

  static async findByUserAndLab(userId: string, laboratoryId: string): Promise<Submission[]> {
    return sql<Submission[]>`
      SELECT * FROM submissions
      WHERE user_id = ${userId} AND laboratory_id = ${laboratoryId}
      ORDER BY attempt_number DESC
    `
  }

  static async getNextAttemptNumber(userId: string, laboratoryId: string): Promise<number> {
    const [{ max }] = await sql<[{ max: number | null }]>`
      SELECT MAX(attempt_number) AS max FROM submissions
      WHERE user_id = ${userId} AND laboratory_id = ${laboratoryId}
    `
    return (max ?? 0) + 1
  }
}
