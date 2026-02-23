// ========================================
// Use Case: CreateExercise
// ========================================
import type { IExerciseRepository } from '../../domain/repositories/IExerciseRepository.js';
import { Exercise } from '../../domain/entities/Exercise.js';
import type { CreateExerciseDTO, ExerciseDTO } from '../dtos/ExerciseDTO.js';
import { ExerciseMapper } from '../mappers/ExerciseMapper.js';

export class CreateExerciseUseCase {
  constructor(private readonly exerciseRepo: IExerciseRepository) {}

  async execute(dto: CreateExerciseDTO): Promise<ExerciseDTO> {
    const exercise = Exercise.create({
      name: dto.name,
      nameJa: dto.nameJa,
      muscleGroup: dto.muscleGroup,
      met: dto.met,
      description: dto.description,
    });

    await this.exerciseRepo.save(exercise);
    return ExerciseMapper.toDTO(exercise);
  }
}
