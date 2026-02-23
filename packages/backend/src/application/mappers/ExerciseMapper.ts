// ========================================
// Mapper: ExerciseMapper
// ========================================
import { Exercise } from '../../domain/entities/Exercise.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';
import { METValue } from '../../domain/value-objects/METValue.js';
import type { ExerciseDTO } from '../dtos/ExerciseDTO.js';

export class ExerciseMapper {
  static toDTO(exercise: Exercise): ExerciseDTO {
    return {
      id: exercise.id.value,
      name: exercise.name,
      nameJa: exercise.nameJa,
      muscleGroup: exercise.muscleGroup,
      met: exercise.met.value,
      description: exercise.description,
      inputType: exercise.inputType,
    };
  }

  static toDomain(dto: ExerciseDTO): Exercise {
    return Exercise.reconstruct({
      id: UniqueId.from(dto.id),
      name: dto.name,
      nameJa: dto.nameJa,
      muscleGroup: dto.muscleGroup,
      met: METValue.create(dto.met),
      description: dto.description,
      inputType: dto.inputType,
    });
  }
}
