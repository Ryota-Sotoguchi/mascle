// ========================================
// Unit Test: ExerciseMapper
// ========================================
import { describe, it, expect } from 'vitest';
import { ExerciseMapper } from '../mappers/ExerciseMapper.js';
import { Exercise } from '../../domain/entities/Exercise.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';
import { METValue } from '../../domain/value-objects/METValue.js';
import type { ExerciseDTO } from '../dtos/ExerciseDTO.js';

describe('ExerciseMapper', () => {
  const exerciseProps = {
    id: UniqueId.from('ex-bench-press'),
    name: 'Bench Press',
    nameJa: 'ベンチプレス',
    muscleGroup: 'chest' as const,
    met: METValue.create(6.0),
    description: '大胸筋を鍛えるコンパウンド種目',
  };

  describe('toDTO', () => {
    it('ExerciseをExerciseDTOに変換する', () => {
      const exercise = Exercise.reconstruct(exerciseProps);
      const dto = ExerciseMapper.toDTO(exercise);

      expect(dto).toEqual({
        id: 'ex-bench-press',
        name: 'Bench Press',
        nameJa: 'ベンチプレス',
        muscleGroup: 'chest',
        met: 6.0,
        description: '大胸筋を鍛えるコンパウンド種目',
        inputType: 'reps_weight',
      });
    });

    it('descriptionがundefinedの場合もOK', () => {
      const exercise = Exercise.reconstruct({
        ...exerciseProps,
        description: undefined,
      });
      const dto = ExerciseMapper.toDTO(exercise);
      expect(dto.description).toBeUndefined();
    });
  });

  describe('toDomain', () => {
    it('ExerciseDTOをExerciseエンティティに変換する', () => {
      const dto: ExerciseDTO = {
        id: 'ex-squat',
        name: 'Barbell Squat',
        nameJa: 'バーベルスクワット',
        muscleGroup: 'legs',
        met: 6.0,
        description: '下半身全体を鍛える',
        inputType: 'reps_weight',
      };

      const exercise = ExerciseMapper.toDomain(dto);

      expect(exercise.id.value).toBe('ex-squat');
      expect(exercise.name).toBe('Barbell Squat');
      expect(exercise.nameJa).toBe('バーベルスクワット');
      expect(exercise.muscleGroup).toBe('legs');
      expect(exercise.met.value).toBe(6.0);
      expect(exercise.description).toBe('下半身全体を鍛える');
    });
  });

  describe('相互変換', () => {
    it('toDTO → toDomain のラウンドトリップでデータが保持される', () => {
      const original = Exercise.reconstruct(exerciseProps);
      const dto = ExerciseMapper.toDTO(original);
      const restored = ExerciseMapper.toDomain(dto);

      expect(restored.id.value).toBe(original.id.value);
      expect(restored.name).toBe(original.name);
      expect(restored.nameJa).toBe(original.nameJa);
      expect(restored.muscleGroup).toBe(original.muscleGroup);
      expect(restored.met.value).toBe(original.met.value);
      expect(restored.description).toBe(original.description);
    });
  });
});
