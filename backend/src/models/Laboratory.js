export class Laboratory {
    static QUIZ_QUESTIONS_REQUIRED = 5;

    constructor({
        id,
        moduleId,
        slug,
        title,
        contentMarkdown,
        position,
        estimatedMinutes = 10,
        quizQuestionsRequired = 5,
        points = 0,
        isPublished = false,
        createdAt,
        updatedAt,
    }) {
        this.id = id;
        this.moduleId = moduleId;
        this.slug = slug;
        this.title = title;
        this.contentMarkdown = contentMarkdown;
        this.position = position;
        this.estimatedMinutes = estimatedMinutes;
        this.quizQuestionsRequired = quizQuestionsRequired;
        this.points = points;
        this.isPublished = isPublished;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ─── Validaciones ────────────────────────────────────────────────────────────

    static validate({ slug, title, contentMarkdown, position, estimatedMinutes, points }) {
        const errors = [];

        if (!slug || !/^[a-z0-9-]+$/.test(slug))
            errors.push('El slug solo puede contener letras minúsculas, números y guiones.');

        if (!title || title.trim().length < 3 || title.trim().length > 180)
            errors.push('El título debe tener entre 3 y 180 caracteres.');

        if (!contentMarkdown || contentMarkdown.trim().length === 0)
            errors.push('El contenido en markdown no puede estar vacío.');

        if (!Number.isInteger(position) || position < 1)
            errors.push('La posición debe ser un entero mayor a 0.');

        if (!Number.isInteger(estimatedMinutes) || estimatedMinutes < 1)
            errors.push('El tiempo estimado debe ser un entero mayor a 0.');

        if (!Number.isInteger(points) || points < 0)
            errors.push('Los puntos deben ser un entero igual o mayor a 0.');

        return errors;
    }

    // ─── Estado ──────────────────────────────────────────────────────────────────

    isAccessibleBy(user) {
        if (this.isPublished) return true;
        return user && user.isAdmin();
    }

    // ─── Proyecciones ─────────────────────────────────────────────────────────────

    /** Vista para el usuario: incluye contenido pero no expone isPublished. */
    toPublic() {
        return {
            id: this.id,
            moduleId: this.moduleId,
            slug: this.slug,
            title: this.title,
            contentMarkdown: this.contentMarkdown,
            position: this.position,
            estimatedMinutes: this.estimatedMinutes,
            points: this.points,
        };
    }

    /** Vista de listado: sin el contenido markdown para aligerar la respuesta. */
    toSummary() {
        return {
            id: this.id,
            moduleId: this.moduleId,
            slug: this.slug,
            title: this.title,
            position: this.position,
            estimatedMinutes: this.estimatedMinutes,
            points: this.points,
        };
    }

    toAdmin() {
        return {
            ...this.toPublic(),
            isPublished: this.isPublished,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}