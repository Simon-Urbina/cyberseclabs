export class Laboratory {
  static readonly QUIZ_QUESTIONS_REQUIRED = 5

  constructor(
    public readonly id: string,
    public readonly moduleId: string,
    public slug: string,
    public title: string,
    public contentMarkdown: string,
    public position: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public estimatedMinutes: number = 10,
    public quizQuestionsRequired: number = 5,
    public points: number = 0,
    public isPublished: boolean = false,
  ) {}

  static validate({ slug, title, contentMarkdown, position, estimatedMinutes, points }: {
    slug: string
    title: string
    contentMarkdown: string
    position: number
    estimatedMinutes: number
    points: number
  }): string[] {
    const errors: string[] = []
    if (!slug || !/^[a-z0-9-]+$/.test(slug))
      errors.push('El slug solo puede contener letras minúsculas, números y guiones.')
    if (!title || title.trim().length < 3 || title.trim().length > 180)
      errors.push('El título debe tener entre 3 y 180 caracteres.')
    if (!contentMarkdown || contentMarkdown.trim().length === 0)
      errors.push('El contenido en markdown no puede estar vacío.')
    if (!Number.isInteger(position) || position < 1)
      errors.push('La posición debe ser un entero mayor a 0.')
    if (!Number.isInteger(estimatedMinutes) || estimatedMinutes < 1)
      errors.push('El tiempo estimado debe ser un entero mayor a 0.')
    if (!Number.isInteger(points) || points < 0)
      errors.push('Los puntos deben ser un entero igual o mayor a 0.')
    return errors
  }

  isAccessibleBy(user: { isAdmin(): boolean } | null): boolean {
    if (this.isPublished) return true
    return user !== null && user.isAdmin()
  }

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
    }
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
    }
  }

  toAdmin() {
    return {
      ...this.toPublic(),
      isPublished: this.isPublished,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
