export class ForumComment {
  static readonly MAX_LENGTH = 2000

  constructor(
    public readonly id: string,
    public readonly userId: string | null,
    public content: string,
    public readonly parentId: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}

  static validate({ content }: { content: unknown }): string[] {
    const errors: string[] = []
    if (typeof content !== 'string' || content.trim().length === 0)
      errors.push('El comentario no puede estar vacío.')
    if (typeof content === 'string' && content.length > ForumComment.MAX_LENGTH)
      errors.push(`El comentario no puede superar los ${ForumComment.MAX_LENGTH} caracteres.`)
    return errors
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null
  }

  toPublic(author: { username: string; profileImage: string | null } | null, replyCount = 0) {
    if (this.isDeleted) {
      return {
        id: this.id,
        content: '[comentario eliminado]',
        author: null,
        parentId: this.parentId,
        replyCount,
        createdAt: this.createdAt,
        isDeleted: true,
      }
    }
    return {
      id: this.id,
      content: this.content,
      author,
      parentId: this.parentId,
      replyCount,
      createdAt: this.createdAt,
      isDeleted: false,
    }
  }
}
