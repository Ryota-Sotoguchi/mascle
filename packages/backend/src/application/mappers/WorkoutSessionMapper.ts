// ========================================
// Mapper: WorkoutSessionMapper
// ========================================
import { WorkoutSession } from '../../domain/entities/WorkoutSession.js';
import { WorkoutSet } from '../../domain/entities/WorkoutSet.js';
import type { WorkoutSessionDTO, WorkoutSetDTO } from '../dtos/WorkoutSessionDTO.js';

export class WorkoutSessionMapper {
  static toDTO(session: WorkoutSession, exerciseNames?: Map<string, { name: string; nameJa: string }>): WorkoutSessionDTO {
    return {
      id: session.id.value,
      date: session.date.toISOString().split('T')[0],
      bodyWeightKg: session.bodyWeightKg,
      note: session.note,
      sets: session.sets.map(set => WorkoutSessionMapper.setToDTO(set, exerciseNames)),
      totalCaloriesBurned: session.totalCaloriesBurned,
      totalSets: session.totalSets,
      totalVolume: session.totalVolume,
      totalDurationMinutes: session.totalDurationMinutes,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }

  static setToDTO(set: WorkoutSet, exerciseNames?: Map<string, { name: string; nameJa: string }>): WorkoutSetDTO {
    const names = exerciseNames?.get(set.exerciseId.value);
    return {
      id: set.id.value,
      exerciseId: set.exerciseId.value,
      exerciseName: names?.name,
      exerciseNameJa: names?.nameJa,
      setNumber: set.setNumber,
      reps: set.reps,
      weightKg: set.weightKg,
      durationMinutes: set.durationMinutes,
      caloriesBurned: set.caloriesBurned,
      speedKmh: set.speedKmh,
    };
  }
}
