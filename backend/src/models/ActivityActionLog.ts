export class ActivityActionLog {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly activityId: string,
    public readonly createdAt: Date,
    public actionPayload: Record<string, unknown> = {},
    public isCorrect: boolean = false,
    public feedback: string | null = null,
    public generatedResponse: string | null = null,
  ) {}

  static validate({ userId, activityId, actionPayload }: {
    userId: string
    activityId: string
    actionPayload: unknown
  }): string[] {
    const errors: string[] = []
    if (!userId) errors.push('El ID del usuario es requerido.')
    if (!activityId) errors.push('El ID de la actividad es requerido.')
    if (!actionPayload || typeof actionPayload !== 'object')
      errors.push('El payload de la acción debe ser un objeto.')
    return errors
  }

  /** Respuesta al usuario luego de intentar la actividad. */
  toFeedback() {
    return {
      isCorrect: this.isCorrect,
      feedback: this.feedback,
      generatedResponse: this.isCorrect ? this.generatedResponse : null,
    }
  }
}
