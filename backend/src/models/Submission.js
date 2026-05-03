export class Submission {
    static REQUIRED_ANSWERS = 5;

    constructor({
        id,
        userId,
        laboratoryId,
        attemptNumber,
        answers,
        answeredQuestionsCount,
        correctAnswersCount,
        scorePercent,
        submittedAt,
    }) {
        this.id = id;
        this.userId = userId;
        this.laboratoryId = laboratoryId;
        this.attemptNumber = attemptNumber;
        this.answers = answers; // Array de { question_id, selected_option_id?, response_text? }
        this.answeredQuestionsCount = answeredQuestionsCount;
        this.correctAnswersCount = correctAnswersCount;
        this.scorePercent = scorePercent;
        this.submittedAt = submittedAt;
    }

    // ─── Validaciones de entrada (antes de calcular score) ───────────────────────

    /**
     * Valida el payload recibido desde el frontend antes de procesarlo en Services.
     * @param {object} params
     * @param {string} params.laboratoryId
     * @param {Array}  params.answers
     * @param {string[]} params.validQuestionIds - IDs de las 5 preguntas del laboratorio.
     */
    static validatePayload({ laboratoryId, answers, validQuestionIds }) {
        const errors = [];

        if (!laboratoryId)
            errors.push('El ID del laboratorio es requerido.');

        if (!Array.isArray(answers) || answers.length !== Submission.REQUIRED_ANSWERS)
            errors.push(`El submission debe contener exactamente ${Submission.REQUIRED_ANSWERS} respuestas.`);

        if (answers && validQuestionIds) {
            const sentIds = answers.map(a => a.question_id);
            const allBelong = sentIds.every(id => validQuestionIds.includes(id));

            if (!allBelong)
                errors.push('Todas las respuestas deben pertenecer a preguntas del laboratorio indicado.');

            const uniqueIds = new Set(sentIds);
            if (uniqueIds.size !== sentIds.length)
                errors.push('No se puede responder la misma pregunta más de una vez.');
        }

        if (answers) {
            answers.forEach((a, i) => {
                const hasOption = a.selected_option_id != null;
                const hasText = a.response_text != null && a.response_text.trim() !== '';

                if (!hasOption && !hasText)
                    errors.push(`La respuesta ${i + 1} debe tener selected_option_id o response_text.`);

                if (hasOption && hasText)
                    errors.push(`La respuesta ${i + 1} no puede tener selected_option_id y response_text a la vez.`);
            });
        }

        return errors;
    }

    // ─── Cálculo de score (ejecutado en Services) ─────────────────────────────────

    /**
     * Calcula el score a partir de las correcciones por pregunta.
     * @param {boolean[]} correctnessMap - Array de booleanos, uno por respuesta.
     * @returns {{ correctAnswersCount: number, scorePercent: number }}
     */
    static calculateScore(correctnessMap) {
        const correct = correctnessMap.filter(Boolean).length;
        const score = parseFloat(((correct / Submission.REQUIRED_ANSWERS) * 100).toFixed(2));
        return { correctAnswersCount: correct, scorePercent: score };
    }

    // ─── Proyecciones ─────────────────────────────────────────────────────────────

    toResult() {
        return {
            id: this.id,
            laboratoryId: this.laboratoryId,
            attemptNumber: this.attemptNumber,
            answeredQuestionsCount: this.answeredQuestionsCount,
            correctAnswersCount: this.correctAnswersCount,
            scorePercent: this.scorePercent,
            submittedAt: this.submittedAt,
        };
    }
}