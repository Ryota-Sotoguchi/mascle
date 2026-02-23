// ========================================
// Use Case: RemoveWorkoutSet
// ========================================
import type { IWorkoutSessionRepository } from '../../domain/repositories/IWorkoutSessionRepository.js';
import type { IExerciseRepository } from '../../domain/repositories/IExerciseRepository.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';
import type { WorkoutSessionDTO } from '../dtos/WorkoutSessionDTO.js';
import { WorkoutSessionMapper } from '../mappers/WorkoutSessionMapper.js';

export class RemoveWorkoutSetUseCase {
  constructor(
    private readonly sessionRepo: IWorkoutSessionRepository,
    private readonly exerciseRepo: IExerciseRepository,
  ) {}

  async execute(sessionId: string, setId: string): Promise<WorkoutSessionDTO> {
    const session = await this.sessionRepo.findById(UniqueId.from(sessionId));
    if (!session) throw new Error(`Session ${sessionId} not found`);

    session.removeSet(UniqueId.from(setId));
    await this.sessionRepo.update(session);

    const exercises = await this.exerciseRepo.findAll();
    const exerciseNames = new Map<string, { name: string; nameJa: string }>();
    for (const ex of exercises) {
      exerciseNames.set(ex.id.value, { name: ex.name, nameJa: ex.nameJa });
    }

    return WorkoutSessionMapper.toDTO(session, exerciseNames);
  }
}
