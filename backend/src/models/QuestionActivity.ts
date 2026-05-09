export class QuestionActivity {
  constructor(
    public readonly id: string,
    public readonly questionId: string,
    public title: string,
    public instructionsMarkdown: string,
    private expectedActionKey: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public successFeedback: string = 'Acción correcta. Usa esta respuesta en el quiz.',
    public isPublished: boolean = false,
  ) {}

  static validate({ title, instructionsMarkdown, expectedActionKey }: {
    title: string
    instructionsMarkdown: string
    expectedActionKey: string
  }): string[] {
    const errors: string[] = []
    if (!title || title.trim().length < 3 || title.trim().length > 180)
      errors.push('El título debe tener entre 3 y 180 caracteres.')
    if (!instructionsMarkdown || instructionsMarkdown.trim().length === 0)
      errors.push('Las instrucciones en markdown no pueden estar vacías.')
    if (!expectedActionKey || expectedActionKey.trim().length === 0)
      errors.push('La clave de acción esperada no puede estar vacía.')
    return errors
  }

  /** Verifica si la acción enviada por el usuario es correcta (case-insensitive). */
  verifyAction(actionKey: string): boolean {
    if (!actionKey) return false
    return actionKey.trim().toLowerCase() === this.expectedActionKey.trim().toLowerCase()
  }

  /** Vista para el usuario: nunca expone expectedActionKey. */
  toPublic() {
    return {
      id: this.id,
      questionId: this.questionId,
      title: this.title,
      instructionsMarkdown: this.instructionsMarkdown,
      successFeedback: this.successFeedback,
    }
  }

  toAdmin() {
    return {
      ...this.toPublic(),
      expectedActionKey: this.expectedActionKey,
      isPublished: this.isPublished,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
