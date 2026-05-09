type RawAnswer = {
  question_id: string
  selected_option_id?: string | null
  response_text?: string | null
}

export class Submission {
  static readonly REQUIRED_ANSWERS = 5

  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly laboratoryId: string,
    public readonly attemptNumber: number,
    public readonly answers: RawAnswer[],
    public readonly answeredQuestionsCount: number,
    public readonly correctAnswersCount: number,
    public readonly scorePercent: number,
    public readonly submittedAt: Date,
  ) {}

  /** Valida el payload recibido desde el frontend antes de procesarlo en Services. */
  static validatePayload({ laboratoryId, answers, validQuestionIds }: {
    laboratoryId: string
    answers: RawAnswer[]
    validQuestionIds: string[]
  }): string[] {
    const errors: string[] = []

    if (!laboratoryId) errors.push('El ID del laboratorio es requerido.')

    if (!Array.isArray(answers) || answers.length !== Submission.REQUIRED_ANSWERS)
      errors.push(`El submission debe contener exactamente ${Submission.REQUIRED_ANSWERS} respuestas.`)

    if (answers && validQuestionIds) {
      const sentIds = answers.map(a => a.question_id)
      if (!sentIds.every(id => validQuestionIds.includes(id)))
        errors.push('Todas las respuestas deben pertenecer a preguntas del laboratorio indicado.')
      if (new Set(sentIds).size !== sentIds.length)
        errors.push('No se puede responder la misma pregunta más de una vez.')
    }

    if (answers) {
      answers.forEach((a, i) => {
        const hasOption = a.selected_option_id != null
        const hasText = a.response_text != null && a.response_text.trim() !== ''
        if (!hasOption && !hasText)
          errors.push(`La respuesta ${i + 1} debe tener selected_option_id o response_text.`)
        if (hasOption && hasText)
          errors.push(`La respuesta ${i + 1} no puede tener selected_option_id y response_text a la vez.`)
      })
    }

    return errors
  }

  /** Calcula el score a partir de las correcciones por pregunta. */
  static calculateScore(correctnessMap: boolean[]): { correctAnswersCount: number; scorePercent: number } {
    const correct = correctnessMap.filter(Boolean).length
    const score = parseFloat(((correct / Submission.REQUIRED_ANSWERS) * 100).toFixed(2))
    return { correctAnswersCount: correct, scorePercent: score }
  }

  toResult() {
    return {
      id: this.id,
      laboratoryId: this.laboratoryId,
      attemptNumber: this.attemptNumber,
      answeredQuestionsCount: this.answeredQuestionsCount,
      correctAnswersCount: this.correctAnswersCount,
      scorePercent: this.scorePercent,
      submittedAt: this.submittedAt,
    }
  }
}
