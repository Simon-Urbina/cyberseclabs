export class User {
    constructor({
        id,
        username,
        email,
        passwordHash,
        role = 'user',
        bio = null,
        profileImage = null,
        points = 0,
        createdAt,
        updatedAt,
        deletedAt = null,
    }) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.bio = bio;
        this.profileImage = profileImage;
        this.points = points;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    // ─── Validaciones ────────────────────────────────────────────────────────────

    static validate({ username, email, password }) {
        const errors = [];

        if (!username || username.trim().length < 3 || username.trim().length > 50)
            errors.push('El username debe tener entre 3 y 50 caracteres.');

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            errors.push('El email no tiene un formato válido.');

        if (!password || password.length < 8)
            errors.push('La contraseña debe tener al menos 8 caracteres.');

        return errors;
    }

    static validateProfileImage({ mimetype, size }) {
        const errors = [];
        const ALLOWED = ['image/jpeg', 'image/jpg'];
        const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

        if (!ALLOWED.includes(mimetype))
            errors.push('La foto de perfil solo acepta formato JPG/JPEG.');

        if (size > MAX_BYTES)
            errors.push('La foto de perfil no puede superar los 5 MB.');

        return errors;
    }

    // ─── Estado ──────────────────────────────────────────────────────────────────

    isDeleted() {
        return this.deletedAt !== null;
    }

    isAdmin() {
        return this.role === 'admin';
    }

    // ─── Proyecciones ─────────────────────────────────────────────────────────────

    /** Datos seguros para incluir en un JWT o sesión (sin hash ni imagen binaria). */
    toSession() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            role: this.role,
        };
    }

    /** Perfil público visible por cualquier visitante. */
    toPublic() {
        return {
            id: this.id,
            username: this.username,
            bio: this.bio,
            points: this.points,
        };
    }

    /** Perfil completo visible solo por el propio usuario. */
    toProfile() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            bio: this.bio,
            points: this.points,
            role: this.role,
            createdAt: this.createdAt
        };
    }

    /** Fila del ranking global. */
    toRankingRow() {
        return {
            id: this.id,
            username: this.username,
            bio: this.bio,
            points: this.points,
        };
    }
}