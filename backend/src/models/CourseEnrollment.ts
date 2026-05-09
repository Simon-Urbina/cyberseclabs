export class CourseEnrollment {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly courseId: string,
    public readonly enrolledAt: Date,
  ) {}

  static validate({ userId, courseId }: { userId: string; courseId: string }): string[] {
    const errors: string[] = []
    if (!userId) errors.push('El ID del usuario es requerido.')
    if (!courseId) errors.push('El ID del curso es requerido.')
    return errors
  }

  toPublic() {
    return {
      id: this.id,
      courseId: this.courseId,
      enrolledAt: this.enrolledAt,
    }
  }
}
