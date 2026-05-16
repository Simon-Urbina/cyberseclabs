import sql from '../db/index.js'
import type { ForumComment } from '../types.js'

const PAGE_SIZE = 20

export class ForumCommentDAO {
  static async findRoots(page: number): Promise<{ rows: ForumComment[]; total: number }> {
    const offset = (page - 1) * PAGE_SIZE
    const rows = await sql<ForumComment[]>`
      SELECT * FROM forum_comments
      WHERE parent_id IS NULL
      ORDER BY created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `
    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*) AS count FROM forum_comments WHERE parent_id IS NULL
    `
    return { rows, total: Number(count) }
  }

  static async findReplies(parentId: string): Promise<ForumComment[]> {
    return sql<ForumComment[]>`
      SELECT * FROM forum_comments
      WHERE parent_id = ${parentId}
      ORDER BY created_at ASC
    `
  }

  static async countReplies(parentId: string): Promise<number> {
    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*) AS count FROM forum_comments WHERE parent_id = ${parentId}
    `
    return Number(count)
  }

  static async findById(id: string): Promise<ForumComment | null> {
    const [row] = await sql<ForumComment[]>`
      SELECT * FROM forum_comments WHERE id = ${id}
    `
    return row ?? null
  }

  static async create(data: {
    userId: string
    content: string
    parentId: string | null
  }): Promise<ForumComment> {
    const [row] = await sql<ForumComment[]>`
      INSERT INTO forum_comments (user_id, content, parent_id)
      VALUES (${data.userId}, ${data.content}, ${data.parentId ?? null})
      RETURNING *
    `
    return row
  }

  static async softDelete(id: string): Promise<void> {
    await sql`
      UPDATE forum_comments
      SET deleted_at = now(), content = '[comentario eliminado]'
      WHERE id = ${id}
    `
  }
}
