import type { Context } from 'hono'
import { SubmissionService } from '../services/SubmissionService.js'
import type { TokenPayload } from '../types.js'

export class SubmissionController {
  static async submit(c: Context) {
    const user = c.get('user') as TokenPayload
    const { labId } = c.req.param()
    const body = await c.req.json<{ answers: unknown }>()
    if (!Array.isArray(body.answers))
      return c.json({ error: '"answers" debe ser un arreglo.' }, 400)
    const result = await SubmissionService.submit(user.id, labId, body.answers)
    return c.json(result, 201)
  }

  static async getHistory(c: Context) {
    const user = c.get('user') as TokenPayload
    const { labId } = c.req.param()
    const submissions = await SubmissionService.getHistory(user.id, labId)
    return c.json(submissions)
  }

  static async checkAnswer(c: Context) {
    const { labId } = c.req.param()
    const body = await c.req.json<{ questionId: string; selectedOptionId: string }>()
    return c.json(await SubmissionService.checkAnswer(labId, body.questionId, body.selectedOptionId))
  }
}
