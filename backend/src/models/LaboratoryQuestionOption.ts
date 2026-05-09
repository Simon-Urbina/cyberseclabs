export class LaboratoryQuestionOption {
  constructor(
    public readonly id: string,
    public readonly questionId: string,
    public optionOrder: number,
    public optionText: string,
    public isCorrect: boolean = false,
  ) {}

  static validate({ optionOrder, optionText }: {
    optionOrder: number
    optionText: string
  }): string[] {
    const errors: string[] = []
    if (!Number.isInteger(optionOrder) || optionOrder < 1)
      errors.push('El orden de la opción debe ser un entero mayor a 0.')
    if (!optionText || optionText.trim().length === 0)
      errors.push('El texto de la opción no puede estar vacío.')
    return errors
  }

  /** Valida que dentro de un conjunto de opciones haya exactamente una opción correcta. */
  static validateSet(options: LaboratoryQuestionOption[]): string[] {
    const errors: string[] = []
    const correctCount = options.filter(o => o.isCorrect).length
    if (correctCount === 0) errors.push('Debe haber exactamente una opción correcta por pregunta.')
    if (correctCount > 1) errors.push('No puede haber más de una opción correcta por pregunta.')
    return errors
  }

  /** Vista para el usuario durante el quiz: nunca expone isCorrect. */
  toQuiz() {
    return {
      id: this.id,
      questionId: this.questionId,
      optionOrder: this.optionOrder,
      optionText: this.optionText,
    }
  }

  /** Vista post-submission: expone isCorrect para retroalimentación. */
  toResult() {
    return {
      ...this.toQuiz(),
      isCorrect: this.isCorrect,
    }
  }
}
