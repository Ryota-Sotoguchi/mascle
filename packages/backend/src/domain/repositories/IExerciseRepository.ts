// ========================================
// Repository Interface (Port): IExerciseRepository
// ========================================
import { Exercise, MuscleGroup } from '../entities/Exercise.js';
import { UniqueId } from '../value-objects/UniqueId.js';

export interface IExerciseRepository {
  findById(id: UniqueId): Promise<Exercise | null>;
  findAll(): Promise<Exercise[]>;
  findByMuscleGroup(group: MuscleGroup): Promise<Exercise[]>;
  save(exercise: Exercise): Promise<void>;
  delete(id: UniqueId): Promise<void>;
}
