export class LaboratoryQuestionOption {
    constructor({
        id,
        questionId,
        optionOrder,
        optionText,
        isCorrect = false,
    }) {
        this.id = id;
        this.questionId = questionId;
        this.optionOrder = optionOrder;
        this.optionText = optionText;
        this.isCorrect = isCorrect;
    }

    // ─── Validaciones ────────────────────────────────────────────────────────────

    static validate({ optionOrder, optionText }) {
        const errors = [];

        if (!Number.isInteger(optionOrder) || optionOrder < 1)
            errors.push('El orden de la opción debe ser un entero mayor a 0.');

        if (!optionText || optionText.trim().length === 0)
            errors.push('El texto de la opción no puede estar vacío.');

        return errors;
    }

    /**
     * Valida que dentro de un conjunto de opciones para la misma pregunta
     * haya exactamente una opción correcta.
     * @param {LaboratoryQuestionOption[]} options
     */
    static validateSet(options) {
        const errors = [];
        const correctCount = options.filter(o => o.isCorrect).length;

        if (correctCount === 0)
            errors.push('Debe haber exactamente una opción correcta por pregunta.');

        if (correctCount > 1)
            errors.push('No puede haber más de una opción correcta por pregunta.');

        return errors;
    }

    // ─── Proyecciones ─────────────────────────────────────────────────────────────

    /** Vista para el usuario durante el quiz: nunca expone is_correct. */
    toQuiz() {
        return {
            id: this.id,
            questionId: this.questionId,
            optionOrder: this.optionOrder,
            optionText: this.optionText,
        };
    }

    /** Vista post-submission: expone is_correct para retroalimentación. */
    toResult() {
        return {
            ...this.toQuiz(),
            isCorrect: this.isCorrect,
        };
    }
}