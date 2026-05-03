import sql from '../db/index.js'
import type { Course, Difficulty } from '../types.js'

export class CourseDAO {
  static async findAll(publishedOnly = true): Promise<Course[]> {
    if (publishedOnly) {
      return sql<Course[]>`
        SELECT * FROM courses WHERE is_published = TRUE ORDER BY created_at DESC
      `
    }
    return sql<Course[]>`SELECT * FROM courses ORDER BY created_at DESC`
  }

  static async findBySlug(slug: string): Promise<Course | null> {
    const [row] = await sql<Course[]>`SELECT * FROM courses WHERE slug = ${slug}`
    return row ?? null
  }

  static async findById(id: string): Promise<Course | null> {
    const [row] = await sql<Course[]>`SELECT * FROM courses WHERE id = ${id}`
    return row ?? null
  }

  static async create(data: {
    slug: string
    title: string
    description?: string | null
    difficulty: Difficulty
    createdBy: string
  }): Promise<Course> {
    const [row] = await sql<Course[]>`
      INSERT INTO courses (slug, title, description, difficulty, created_by)
      VALUES (${data.slug}, ${data.title}, ${data.description ?? null}, ${data.difficulty}, ${data.createdBy})
      RETURNING *
    `
    return row
  }

  static async update(
    id: string,
    data: Partial<Pick<Course, 'slug' | 'title' | 'description' | 'difficulty' | 'isPublished'>>,
  ): Promise<Course | null> {
    const [row] = await sql<Course[]>`
      UPDATE courses SET
        slug        = COALESCE(${data.slug ?? null}, slug),
        title       = COALESCE(${data.title ?? null}, title),
        description = COALESCE(${data.description ?? null}, description),
        difficulty  = COALESCE(${data.difficulty ?? null}::course_diff, difficulty),
        is_published = COALESCE(${data.isPublished ?? null}, is_published)
      WHERE id = ${id}
      RETURNING *
    `
    return row ?? null
  }
}
