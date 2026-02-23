// ========================================
// Repository Interface (Port): IWorkoutSessionRepository
// ========================================
import { WorkoutSession } from '../entities/WorkoutSession.js';
import { UniqueId } from '../value-objects/UniqueId.js';

export interface IWorkoutSessionRepository {
  findById(id: UniqueId): Promise<WorkoutSession | null>;
  findByUserId(userId: UniqueId): Promise<WorkoutSession[]>;
  findByUserIdAndDateRange(userId: UniqueId, from: Date, to: Date): Promise<WorkoutSession[]>;
  save(session: WorkoutSession): Promise<void>;
  update(session: WorkoutSession): Promise<void>;
  delete(id: UniqueId): Promise<void>;
}
