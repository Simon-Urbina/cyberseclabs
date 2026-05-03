export class CourseModule {
    constructor({
        id,
        courseId,
        slug,
        title,
        description = null,
        position,
        createdAt,
        updatedAt,
    }) {
        this.id = id;
        this.courseId = courseId;
        this.slug = slug;
        this.title = title;
        this.description = description;
        this.position = position;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ─── Validaciones ────────────────────────────────────────────────────────────

    static validate({ slug, title, position }) {
        const errors = [];

        if (!slug || !/^[a-z0-9-]+$/.test(slug))
            errors.push('El slug solo puede contener letras minúsculas, números y guiones.');

        if (!title || title.trim().length < 3 || title.trim().length > 180)
            errors.push('El título debe tener entre 3 y 180 caracteres.');

        if (!Number.isInteger(position) || position < 1)
            errors.push('La posición debe ser un entero mayor a 0.');

        return errors;
    }

    // ─── Proyecciones ─────────────────────────────────────────────────────────────

    toPublic() {
        return {
            id: this.id,
            courseId: this.courseId,
            slug: this.slug,
            title: this.title,
            description: this.description,
            position: this.position,
        };
    }
}