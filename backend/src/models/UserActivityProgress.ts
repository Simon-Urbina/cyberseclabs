import type { ActivityStatus } from '../types.js'

export class UserActivityProgress {
  static readonly STATUSES: ActivityStatus[] = ['not_started', 'in_progress', 'completed']

  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly activityId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public status: ActivityStatus = 'not_started',
    public attemptsCount: number = 0,
    public generatedResponse: string | null = null,
    public generatedResponseIssuedAt: Date | null = null,
    public completedAt: Date | null = null,
    public lastActionPayload: Record<string, unknown> = {},
  ) {}

  isCompleted(): boolean {
    return this.status === 'completed'
  }

  /** Indica si el usuario ya tiene una respuesta generada lista para usar en el quiz. */
  hasGeneratedResponse(): boolean {
    return this.generatedResponse !== null && this.generatedResponse.trim() !== ''
  }

  /**
   * Verifica si la respuesta ingresada en el quiz coincide con la generada por la actividad.
   */
  matchesGeneratedResponse(inputText: string): boolean {
    if (!this.hasGeneratedResponse() || !inputText) return false
    return inputText.trim() === this.generatedResponse!.trim()
  }

  /**
   * Vista para el usuario: incluye la generatedResponse si existe,
   * para que pueda copiarla y usarla en el quiz.
   */
  toPublic() {
    return {
      activityId: this.activityId,
      status: this.status,
      attemptsCount: this.attemptsCount,
      generatedResponse: this.generatedResponse,
      generatedResponseIssuedAt: this.generatedResponseIssuedAt,
      completedAt: this.completedAt,
    }
  }
}
