// ========================================
// DTOs: Exercise
// ========================================
import type { MuscleGroup, InputType } from '../../domain/entities/Exercise.js';

export interface ExerciseDTO {
  id: string;
  name: string;
  nameJa: string;
  muscleGroup: MuscleGroup;
  met: number;
  description?: string;
  inputType: InputType;
}

export interface CreateExerciseDTO {
  name: string;
  nameJa: string;
  muscleGroup: MuscleGroup;
  met: number;
  description?: string;
  inputType?: InputType;
}
