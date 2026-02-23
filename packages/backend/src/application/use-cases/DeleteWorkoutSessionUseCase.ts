// ========================================
// Use Case: DeleteWorkoutSession
// ========================================
import type { IWorkoutSessionRepository } from '../../domain/repositories/IWorkoutSessionRepository.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';

export class DeleteWorkoutSessionUseCase {
  constructor(private readonly sessionRepo: IWorkoutSessionRepository) {}

  async execute(id: string): Promise<void> {
    await this.sessionRepo.delete(UniqueId.from(id));
  }
}
