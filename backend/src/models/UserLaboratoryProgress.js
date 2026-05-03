export class UserLaboratoryProgress {
    static STATUSES = ['not_started', 'in_progress', 'completed'];

    constructor({
        id,
        userId,
        laboratoryId,
        status = 'not_started',
        attemptsCount = 0,
        bestScorePercent = 0,
        lastScorePercent = null,
        completedAt = null,
        lastSubmissionAt = null,
        lastSubmissionId = null,
        createdAt,
        updatedAt,
    }) {
        this.id = id;
        this.userId = userId;
        this.laboratoryId = laboratoryId;
        this.status = status;
        this.attemptsCount = attemptsCount;
        this.bestScorePercent = bestScorePercent;
        this.lastScorePercent = lastScorePercent;
        this.completedAt = completedAt;
        this.lastSubmissionAt = lastSubmissionAt;
        this.lastSubmissionId = lastSubmissionId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ─── Estado ──────────────────────────────────────────────────────────────────

    isCompleted() {
        return this.status === 'completed';
    }

    isInProgress() {
        return this.status === 'in_progress';
    }

    hasNeverAttempted() {
        return this.attemptsCount === 0;
    }

    // ─── Proyecciones ─────────────────────────────────────────────────────────────

    toPublic() {
        return {
            laboratoryId: this.laboratoryId,
            status: this.status,
            attemptsCount: this.attemptsCount,
            bestScorePercent: this.bestScorePercent,
            lastScorePercent: this.lastScorePercent,
            completedAt: this.completedAt,
            lastSubmissionAt: this.lastSubmissionAt,
        };
    }
}