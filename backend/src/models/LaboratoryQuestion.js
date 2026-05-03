export class LaboratoryQuestion {
    static TYPES = ['multiple_choice', 'activity_response'];
    static MIN_ORDER = 1;
    static MAX_ORDER = 5;

    constructor({
        id,
        laboratoryId,
        questionOrder,
        questionType = 'multiple_choice',
        questionText,
        explanation = null,
        createdAt,
        updatedAt,
    }) {
        this.id = id;
        this.laboratoryId = laboratoryId;
        this.questionOrder = questionOrder;
        this.questionType = questionType;
        this.questionText = questionText;
        this.explanation = explanation;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ─── Validaciones ────────────────────────────────────────────────────────────

    static validate({ questionOrder, questionType, questionText }) {
        const errors = [];

        if (
            !Number.isInteger(questionOrder) ||
            questionOrder < LaboratoryQuestion.MIN_ORDER ||
            questionOrder > LaboratoryQuestion.MAX_ORDER
        )
            errors.push(`El orden de pregunta debe estar entre ${LaboratoryQuestion.MIN_ORDER} y ${LaboratoryQuestion.MAX_ORDER}.`);

        if (!LaboratoryQuestion.TYPES.includes(questionType))
            errors.push(`El tipo de pregunta debe ser uno de: ${LaboratoryQuestion.TYPES.join(', ')}.`);

        if (!questionText || questionText.trim().length === 0)
            errors.push('El texto de la pregunta no puede estar vacío.');

        return errors;
    }

    // ─── Estado ──────────────────────────────────────────────────────────────────

    isActivityType() {
        return this.questionType === 'activity_response';
    }

    isMultipleChoice() {
        return this.questionType === 'multiple_choice';
    }

    // ─── Proyecciones ─────────────────────────────────────────────────────────────

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
        };
    }

    /** Vista post-submission: incluye la explicación para retroalimentación. */
    toResult() {
        return {
            ...this.toQuiz(),
            explanation: this.explanation,
        };
    }
}