// ========================================
// Use Case: GetWorkoutSessionById
// ========================================
import type { IWorkoutSessionRepository } from '../../domain/repositories/IWorkoutSessionRepository.js';
import type { IExerciseRepository } from '../../domain/repositories/IExerciseRepository.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';
import type { WorkoutSessionDTO } from '../dtos/WorkoutSessionDTO.js';
import { WorkoutSessionMapper } from '../mappers/WorkoutSessionMapper.js';

export class GetWorkoutSessionByIdUseCase {
  constructor(
    private readonly sessionRepo: IWorkoutSessionRepository,
    private readonly exerciseRepo: IExerciseRepository,
  ) {}

  async execute(id: string): Promise<WorkoutSessionDTO | null> {
    const session = await this.sessionRepo.findById(UniqueId.from(id));
    if (!session) return null;

    const exercises = await this.exerciseRepo.findAll();
    const exerciseNames = new Map<string, { name: string; nameJa: string }>();
    for (const ex of exercises) {
      exerciseNames.set(ex.id.value, { name: ex.name, nameJa: ex.nameJa });
    }

    return WorkoutSessionMapper.toDTO(session, exerciseNames);
  }
}
