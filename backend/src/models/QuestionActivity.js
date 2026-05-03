export class QuestionActivity {
    constructor({
        id,
        questionId,
        title,
        instructionsMarkdown,
        expectedActionKey,
        successFeedback = 'Acción correcta. Usa esta respuesta en el quiz.',
        isPublished = false,
        createdAt,
        updatedAt,
    }) {
        this.id = id;
        this.questionId = questionId;
        this.title = title;
        this.instructionsMarkdown = instructionsMarkdown;
        this.expectedActionKey = expectedActionKey;
        this.successFeedback = successFeedback;
        this.isPublished = isPublished;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ─── Validaciones ────────────────────────────────────────────────────────────

    static validate({ title, instructionsMarkdown, expectedActionKey }) {
        const errors = [];

        if (!title || title.trim().length < 3 || title.trim().length > 180)
            errors.push('El título debe tener entre 3 y 180 caracteres.');

        if (!instructionsMarkdown || instructionsMarkdown.trim().length === 0)
            errors.push('Las instrucciones en markdown no pueden estar vacías.');

        if (!expectedActionKey || expectedActionKey.trim().length === 0)
            errors.push('La clave de acción esperada no puede estar vacía.');

        return errors;
    }

    // ─── Lógica de verificación ───────────────────────────────────────────────────

    /**
     * Verifica si la acción enviada por el usuario es correcta.
     * La comparación es case-insensitive y elimina espacios sobrantes.
     * @param {string} actionKey - Clave enviada por el usuario.
     * @returns {boolean}
     */
    verifyAction(actionKey) {
        if (!actionKey) return false;
        return actionKey.trim().toLowerCase() === this.expectedActionKey.trim().toLowerCase();
    }

    // ─── Proyecciones ─────────────────────────────────────────────────────────────

    /** Vista para el usuario: nunca expone expected_action_key. */
    toPublic() {
        return {
            id: this.id,
            questionId: this.questionId,
            title: this.title,
            instructionsMarkdown: this.instructionsMarkdown,
            successFeedback: this.successFeedback,
        };
    }

    toAdmin() {
        return {
            ...this.toPublic(),
            expectedActionKey: this.expectedActionKey,
            isPublished: this.isPublished,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}