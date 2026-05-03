import { UserDAO } from '../daos/UserDAO.js'
import { HTTPError } from '../utils/errors.js'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/jpg']

export class UserService {
  static async getPublicProfile(username: string) {
    const user = await UserDAO.findByUsername(username)
    if (!user) throw new HTTPError(404, 'Usuario no encontrado.')
    const [completedLabs, rank] = await Promise.all([
      UserDAO.countCompletedLabs(user.id),
      UserDAO.getRank(user.id),
    ])
    return {
      id: user.id,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage ? Buffer.from(user.profileImage).toString('base64') : null,
      points: user.points,
      completedLabs,
      rank,
    }
  }

  static async getMyProfile(userId: string) {
    const user = await UserDAO.findById(userId)
    if (!user) throw new HTTPError(404, 'Usuario no encontrado.')
    const [completedLabs, rank] = await Promise.all([
      UserDAO.countCompletedLabs(userId),
      UserDAO.getRank(userId),
    ])
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage ? Buffer.from(user.profileImage).toString('base64') : null,
      points: user.points,
      role: user.role,
      createdAt: user.createdAt,
      completedLabs,
      rank,
    }
  }

  static async updateProfile(userId: string, data: { bio?: string | null }) {
    const user = await UserDAO.update(userId, data)
    if (!user) throw new HTTPError(404, 'Usuario no encontrado.')
    return UserService.getMyProfile(userId)
  }

  static async updateAvatar(
    userId: string,
    file: { buffer: Buffer; mimetype: string; size: number },
  ): Promise<void> {
    if (!ALLOWED_MIMETYPES.includes(file.mimetype))
      throw new HTTPError(400, 'La foto de perfil solo acepta formato JPG/JPEG.')
    if (file.size > MAX_IMAGE_BYTES)
      throw new HTTPError(400, 'La foto de perfil no puede superar los 5 MB.')
    await UserDAO.updateAvatar(userId, file.buffer)
  }

  static async getRanking(page = 1, limit = 20) {
    const safeLimit = Math.min(limit, 100)
    const offset = (page - 1) * safeLimit
    const [users, total] = await Promise.all([
      UserDAO.findRanking(safeLimit, offset),
      UserDAO.countRanking(),
    ])
    return {
      data: users.map((u, i) => ({
        rank: offset + i + 1,
        id: u.id,
        username: u.username,
        bio: u.bio,
        points: u.points,
      })),
      total,
      page,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    }
  }
}
