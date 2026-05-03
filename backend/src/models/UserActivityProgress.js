export class UserActivityProgress {
    static STATUSES = ['not_started', 'in_progress', 'completed'];

    constructor({
        id,
        userId,
        activityId,
        status = 'not_started',
        attemptsCount = 0,
        generatedResponse = null,
        generatedResponseIssuedAt = null,
        completedAt = null,
        lastActionPayload = {},
        createdAt,
        updatedAt,
    }) {
        this.id = id;
        this.userId = userId;
        this.activityId = activityId;
        this.status = status;
        this.attemptsCount = attemptsCount;
        this.generatedResponse = generatedResponse;
        this.generatedResponseIssuedAt = generatedResponseIssuedAt;
        this.completedAt = completedAt;
        this.lastActionPayload = lastActionPayload;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ─── Estado ──────────────────────────────────────────────────────────────────

    isCompleted() {
        return this.status === 'completed';
    }

    /**
     * Indica si el usuario ya tiene una respuesta generada lista para usar en el quiz.
     * @returns {boolean}
     */
    hasGeneratedResponse() {
        return this.generatedResponse !== null && this.generatedResponse.trim() !== '';
    }

    /**
     * Verifica si la respuesta ingresada por el usuario en el quiz coincide
     * con la respuesta generada por la actividad.
     * @param {string} inputText - Texto ingresado por el usuario en la pregunta.
     * @returns {boolean}
     */
    matchesGeneratedResponse(inputText) {
        if (!this.hasGeneratedResponse() || !inputText) return false;
        return inputText.trim() === this.generatedResponse.trim();
    }

    // ─── Proyecciones ─────────────────────────────────────────────────────────────

    /**
     * Vista para el usuario: incluye la generated_response si existe,
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
        };
    }
}