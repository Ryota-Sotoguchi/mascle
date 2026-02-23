// ========================================
// Use Case: CreateWorkoutSession
// ========================================
import type { IWorkoutSessionRepository } from '../../domain/repositories/IWorkoutSessionRepository.js';
import { WorkoutSession } from '../../domain/entities/WorkoutSession.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';
import type { CreateWorkoutSessionDTO, WorkoutSessionDTO } from '../dtos/WorkoutSessionDTO.js';
import { WorkoutSessionMapper } from '../mappers/WorkoutSessionMapper.js';

export class CreateWorkoutSessionUseCase {
  constructor(private readonly sessionRepo: IWorkoutSessionRepository) {}

  async execute(dto: CreateWorkoutSessionDTO): Promise<WorkoutSessionDTO> {
    const session = WorkoutSession.create({
      userId: UniqueId.from(dto.userId),
      date: new Date(dto.date),
      bodyWeightKg: dto.bodyWeightKg,
      note: dto.note,
    });

    await this.sessionRepo.save(session);
    return WorkoutSessionMapper.toDTO(session);
  }
}
