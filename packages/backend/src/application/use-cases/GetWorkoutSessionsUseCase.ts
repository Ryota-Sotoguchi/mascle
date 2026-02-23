// ========================================
// Use Case: GetWorkoutSessions
// ========================================
import type { IWorkoutSessionRepository } from '../../domain/repositories/IWorkoutSessionRepository.js';
import type { IExerciseRepository } from '../../domain/repositories/IExerciseRepository.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';
import type { WorkoutSessionDTO } from '../dtos/WorkoutSessionDTO.js';
import { WorkoutSessionMapper } from '../mappers/WorkoutSessionMapper.js';

export class GetWorkoutSessionsUseCase {
  constructor(
    private readonly sessionRepo: IWorkoutSessionRepository,
    private readonly exerciseRepo: IExerciseRepository,
  ) {}

  async execute(userId: string, from?: string, to?: string): Promise<WorkoutSessionDTO[]> {
    const uid = UniqueId.from(userId);
    const sessions = (from && to)
      ? await this.sessionRepo.findByUserIdAndDateRange(uid, new Date(from), new Date(to))
      : await this.sessionRepo.findByUserId(uid);

    // エクササイズ名のマップを構築
    const exercises = await this.exerciseRepo.findAll();
    const exerciseNames = new Map<string, { name: string; nameJa: string }>();
    for (const ex of exercises) {
      exerciseNames.set(ex.id.value, { name: ex.name, nameJa: ex.nameJa });
    }

    return sessions.map(s => WorkoutSessionMapper.toDTO(s, exerciseNames));
  }
}
