export class CourseModule {
  constructor(
    public readonly id: string,
    public readonly courseId: string,
    public slug: string,
    public title: string,
    public position: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public description: string | null = null,
  ) {}

  static validate({ slug, title, position }: {
    slug: string
    title: string
    position: number
  }): string[] {
    const errors: string[] = []
    if (!slug || !/^[a-z0-9-]+$/.test(slug))
      errors.push('El slug solo puede contener letras minúsculas, números y guiones.')
    if (!title || title.trim().length < 3 || title.trim().length > 180)
      errors.push('El título debe tener entre 3 y 180 caracteres.')
    if (!Number.isInteger(position) || position < 1)
      errors.push('La posición debe ser un entero mayor a 0.')
    return errors
  }

  toPublic() {
    return {
      id: this.id,
      courseId: this.courseId,
      slug: this.slug,
      title: this.title,
      description: this.description,
      position: this.position,
    }
  }
}
