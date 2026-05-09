import type { LaboratoryStatus } from '../types.js'

export class UserLaboratoryProgress {
  static readonly STATUSES: LaboratoryStatus[] = ['not_started', 'in_progress', 'completed']

  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly laboratoryId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public status: LaboratoryStatus = 'not_started',
    public attemptsCount: number = 0,
    public bestScorePercent: number = 0,
    public lastScorePercent: number | null = null,
    public completedAt: Date | null = null,
    public lastSubmissionAt: Date | null = null,
    public lastSubmissionId: string | null = null,
  ) {}

  isCompleted(): boolean {
    return this.status === 'completed'
  }

  isInProgress(): boolean {
    return this.status === 'in_progress'
  }

  hasNeverAttempted(): boolean {
    return this.attemptsCount === 0
  }

  toPublic() {
    return {
      laboratoryId: this.laboratoryId,
      status: this.status,
      attemptsCount: this.attemptsCount,
      bestScorePercent: this.bestScorePercent,
      lastScorePercent: this.lastScorePercent,
      completedAt: this.completedAt,
      lastSubmissionAt: this.lastSubmissionAt,
    }
  }
}
