import sql from '../db/index.js'
import type { Laboratory } from '../types.js'

export class LaboratoryDAO {
  static async findByModuleId(moduleId: string, publishedOnly = true): Promise<Laboratory[]> {
    if (publishedOnly) {
      return sql<Laboratory[]>`
        SELECT * FROM laboratories
        WHERE module_id = ${moduleId} AND is_published = TRUE
        ORDER BY position ASC
      `
    }
    return sql<Laboratory[]>`
      SELECT * FROM laboratories WHERE module_id = ${moduleId} ORDER BY position ASC
    `
  }

  static async findBySlug(moduleId: string, slug: string): Promise<Laboratory | null> {
    const [row] = await sql<Laboratory[]>`
      SELECT * FROM laboratories WHERE module_id = ${moduleId} AND slug = ${slug}
    `
    return row ?? null
  }

  static async findById(id: string): Promise<Laboratory | null> {
    const [row] = await sql<Laboratory[]>`SELECT * FROM laboratories WHERE id = ${id}`
    return row ?? null
  }

  static async create(data: {
    moduleId: string
    slug: string
    title: string
    contentMarkdown: string
    position: number
    estimatedMinutes?: number
    points?: number
  }): Promise<Laboratory> {
    const [row] = await sql<Laboratory[]>`
      INSERT INTO laboratories (module_id, slug, title, content_markdown, position, estimated_minutes, points)
      VALUES (
        ${data.moduleId}, ${data.slug}, ${data.title}, ${data.contentMarkdown},
        ${data.position}, ${data.estimatedMinutes ?? 10}, ${data.points ?? 0}
      )
      RETURNING *
    `
    return row
  }

  static async update(
    id: string,
    data: Partial<Pick<Laboratory, 'slug' | 'title' | 'contentMarkdown' | 'position' | 'estimatedMinutes' | 'points' | 'isPublished'>>,
  ): Promise<Laboratory | null> {
    const [row] = await sql<Laboratory[]>`
      UPDATE laboratories SET
        slug             = COALESCE(${data.slug ?? null}, slug),
        title            = COALESCE(${data.title ?? null}, title),
        content_markdown = COALESCE(${data.contentMarkdown ?? null}, content_markdown),
        position         = COALESCE(${data.position ?? null}, position),
        estimated_minutes = COALESCE(${data.estimatedMinutes ?? null}, estimated_minutes),
        points           = COALESCE(${data.points ?? null}, points),
        is_published     = COALESCE(${data.isPublished ?? null}, is_published)
      WHERE id = ${id}
      RETURNING *
    `
    return row ?? null
  }
}
