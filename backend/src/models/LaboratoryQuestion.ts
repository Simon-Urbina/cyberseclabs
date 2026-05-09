import type { QuestionType } from '../types.js'

export class LaboratoryQuestion {
  static readonly TYPES: QuestionType[] = ['multiple_choice', 'activity_response']
  static readonly MIN_ORDER = 1
  static readonly MAX_ORDER = 5

  constructor(
    public readonly id: string,
    public readonly laboratoryId: string,
    public questionOrder: number,
    public questionText: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public questionType: QuestionType = 'multiple_choice',
    public explanation: string | null = null,
  ) {}

  static validate({ questionOrder, questionType, questionText }: {
    questionOrder: number
    questionType: string
    questionText: string
  }): string[] {
    const errors: string[] = []
    if (
      !Number.isInteger(questionOrder) ||
      questionOrder < LaboratoryQuestion.MIN_ORDER ||
      questionOrder > LaboratoryQuestion.MAX_ORDER
    )
      errors.push(`El orden de pregunta debe estar entre ${LaboratoryQuestion.MIN_ORDER} y ${LaboratoryQuestion.MAX_ORDER}.`)
    if (!LaboratoryQuestion.TYPES.includes(questionType as QuestionType))
      errors.push(`El tipo de pregunta debe ser uno de: ${LaboratoryQuestion.TYPES.join(', ')}.`)
    if (!questionText || questionText.trim().length === 0)
      errors.push('El texto de la pregunta no puede estar vacío.')
    return errors
  }

  isActivityType(): boolean {
    return this.questionType === 'activity_response'
  }

  isMultipleChoice(): boolean {
    return this.questionType === 'multiple_choice'
  }

  /**
   * Vista para el usuario durante el quiz.
   * No expone explanation hasta que el quiz haya sido enviado.
   */
  toQuiz() {
    return {
      id: this.id,
      laboratoryId: this.laboratoryId,
      questionOrder: this.questionOrder,
      questionType: this.questionType,
      questionText: this.questionText,
    }
  }

  /** Vista post-submission: incluye la explicación para retroalimentación. */
  toResult() {
    return {
      ...this.toQuiz(),
      explanation: this.explanation,
    }
  }
}
