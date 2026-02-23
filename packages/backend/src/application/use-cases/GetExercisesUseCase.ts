// ========================================
// Use Case: GetExercises
// ========================================
import type { IExerciseRepository } from '../../domain/repositories/IExerciseRepository.js';
import type { ExerciseDTO } from '../dtos/ExerciseDTO.js';
import { ExerciseMapper } from '../mappers/ExerciseMapper.js';
import type { MuscleGroup } from '../../domain/entities/Exercise.js';

export class GetExercisesUseCase {
  constructor(private readonly exerciseRepo: IExerciseRepository) {}

  async execute(muscleGroup?: MuscleGroup): Promise<ExerciseDTO[]> {
    const exercises = muscleGroup
      ? await this.exerciseRepo.findByMuscleGroup(muscleGroup)
      : await this.exerciseRepo.findAll();

    return exercises.map(ExerciseMapper.toDTO);
  }
}
