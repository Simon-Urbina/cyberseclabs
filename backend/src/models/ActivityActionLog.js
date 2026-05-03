export class ActivityActionLog {
    constructor({
        id,
        userId,
        activityId,
        actionPayload = {},
        isCorrect = false,
        feedback = null,
        generatedResponse = null,
        createdAt,
    }) {
        this.id = id;
        this.userId = userId;
        this.activityId = activityId;
        this.actionPayload = actionPayload;
        this.isCorrect = isCorrect;
        this.feedback = feedback;
        this.generatedResponse = generatedResponse;
        this.createdAt = createdAt;
    }

    // ─── Validaciones ────────────────────────────────────────────────────────────

    static validate({ userId, activityId, actionPayload }) {
        const errors = [];

        if (!userId)
            errors.push('El ID del usuario es requerido.');

        if (!activityId)
            errors.push('El ID de la actividad es requerido.');

        if (!actionPayload || typeof actionPayload !== 'object')
            errors.push('El payload de la acción debe ser un objeto.');

        return errors;
    }

    // ─── Proyecciones ─────────────────────────────────────────────────────────────

    /** Respuesta al usuario luego de intentar la actividad. */
    toFeedback() {
        return {
            isCorrect: this.isCorrect,
            feedback: this.feedback,
            generatedResponse: this.isCorrect ? this.generatedResponse : null,
        };
    }
}