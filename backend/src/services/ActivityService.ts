import { QuestionActivityDAO } from '../daos/QuestionActivityDAO.js'
import { ActivityActionLogDAO } from '../daos/ActivityActionLogDAO.js'
import { UserActivityProgressDAO } from '../daos/UserActivityProgressDAO.js'
import { HTTPError } from '../utils/errors.js'
import { generateActivityResponse } from '../utils/response.js'

export class ActivityService {
  static async attempt(
    userId: string,
    activityId: string,
    actionPayload: Record<string, unknown>,
  ) {
    const activity = await QuestionActivityDAO.findById(activityId)
    if (!activity || !activity.isPublished)
      throw new HTTPError(404, 'Actividad no encontrada.')

    // If already completed, return the stored response without logging another attempt
    const existing = await UserActivityProgressDAO.find(userId, activityId)
    if (existing?.status === 'completed') {
      return {
        isCorrect: true,
        feedback: activity.successFeedback,
        generatedResponse: existing.generatedResponse,
        alreadyCompleted: true,
      }
    }

    // Accept the action under the key 'action' or 'command' (first value as fallback)
    const submitted = String(
      actionPayload.action ?? actionPayload.command ?? Object.values(actionPayload)[0] ?? '',
    ).trim()
    const isCorrect = submitted === activity.expectedActionKey.trim()

    const generatedResponse = isCorrect ? generateActivityResponse(userId, activityId) : null
    const feedback = isCorrect
      ? activity.successFeedback
      : 'Acción incorrecta. Revisa el comando e inténtalo de nuevo.'

    // Insert log → DB trigger upserts user_activity_progress automatically
    await ActivityActionLogDAO.create({
      userId,
      activityId,
      actionPayload,
      isCorrect,
      feedback,
      generatedResponse,
    })

    return { isCorrect, feedback, generatedResponse, alreadyCompleted: false }
  }
}
