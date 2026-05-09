import type { Difficulty } from '../types.js'

export class Course {
  static readonly DIFFICULTIES: Difficulty[] = ['principiante', 'intermedio', 'avanzado']

  constructor(
    public readonly id: string,
    public slug: string,
    public title: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public description: string | null = null,
    public difficulty: Difficulty = 'principiante',
    public isPublished: boolean = false,
    public createdBy: string | null = null,
  ) {}

  static validate({ slug, title, difficulty }: {
    slug: string
    title: string
    difficulty?: string
  }): string[] {
    const errors: string[] = []
    if (!slug || !/^[a-z0-9-]+$/.test(slug))
      errors.push('El slug solo puede contener letras minúsculas, números y guiones.')
    if (!title || title.trim().length < 3 || title.trim().length > 180)
      errors.push('El título debe tener entre 3 y 180 caracteres.')
    if (difficulty && !Course.DIFFICULTIES.includes(difficulty as Difficulty))
      errors.push(`La dificultad debe ser una de: ${Course.DIFFICULTIES.join(', ')}.`)
    return errors
  }

  isAccessibleBy(user: { isAdmin(): boolean } | null): boolean {
    if (this.isPublished) return true
    return user !== null && user.isAdmin()
  }

  toPublic() {
    return {
      id: this.id,
      slug: this.slug,
      title: this.title,
      description: this.description,
      difficulty: this.difficulty,
    }
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
    }
  }
}
