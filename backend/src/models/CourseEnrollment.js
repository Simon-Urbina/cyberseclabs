export class CourseEnrollment {
    constructor({
        id,
        userId,
        courseId,
        enrolledAt,
    }) {
        this.id = id;
        this.userId = userId;
        this.courseId = courseId;
        this.enrolledAt = enrolledAt;
    }

    // ─── Validaciones ────────────────────────────────────────────────────────────

    static validate({ userId, courseId }) {
        const errors = [];

        if (!userId)
            errors.push('El ID del usuario es requerido.');

        if (!courseId)
            errors.push('El ID del curso es requerido.');

        return errors;
    }

    // ─── Proyecciones ─────────────────────────────────────────────────────────────

    toPublic() {
        return {
            id: this.id,
            courseId: this.courseId,
            enrolledAt: this.enrolledAt,
        };
    }
}