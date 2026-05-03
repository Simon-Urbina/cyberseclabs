export class Course {
    constructor({
        id,
        slug,
        title,
        description = null,
        difficulty = 'principiante',
        isPublished = false,
        createdBy = null,
        createdAt,
        updatedAt,
    }) {
        this.id = id;
        this.slug = slug;
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.isPublished = isPublished;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ─── Validaciones ────────────────────────────────────────────────────────────

    static DIFFICULTIES = ['principiante', 'intermedio', 'avanzado'];

    static validate({ slug, title, difficulty }) {
        const errors = [];

        if (!slug || !/^[a-z0-9-]+$/.test(slug))
            errors.push('El slug solo puede contener letras minúsculas, números y guiones.');

        if (!title || title.trim().length < 3 || title.trim().length > 180)
            errors.push('El título debe tener entre 3 y 180 caracteres.');

        if (difficulty && !Course.DIFFICULTIES.includes(difficulty))
            errors.push(`La dificultad debe ser una de: ${Course.DIFFICULTIES.join(', ')}.`);

        return errors;
    }

    // ─── Estado ──────────────────────────────────────────────────────────────────

    isAccessibleBy(user) {
        if (this.isPublished) return true;
        return user && user.isAdmin();
    }

    // ─── Proyecciones ─────────────────────────────────────────────────────────────

    toPublic() {
        return {
            id: this.id,
            slug: this.slug,
            title: this.title,
            description: this.description,
            difficulty: this.difficulty,
        };
    }

    toAdmin() {
        return {
            id: this.id,
            slug: this.slug,
            title: this.title,
            description: this.description,
            difficulty: this.difficulty,
            isPublished: this.isPublished,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}