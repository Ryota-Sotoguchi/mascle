// ========================================
// Unit Test: WorkoutSessionMapper
// ========================================
import { describe, it, expect } from 'vitest';
import { WorkoutSessionMapper } from '../mappers/WorkoutSessionMapper.js';
import { WorkoutSession } from '../../domain/entities/WorkoutSession.js';
import { WorkoutSet } from '../../domain/entities/WorkoutSet.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';

describe('WorkoutSessionMapper', () => {
  function createSessionWithSet() {
    const set = WorkoutSet.reconstruct({
      id: UniqueId.from('set-001'),
      exerciseId: UniqueId.from('ex-bench-press'),
      setNumber: 1,
      reps: 10,
      weightKg: 60,
      durationMinutes: 1.5,
      caloriesBurned: 15.0,
    });

    const session = WorkoutSession.reconstruct({
      id: UniqueId.from('session-001'),
      userId: UniqueId.from('user-test'),
      date: new Date('2026-02-13'),
      bodyWeightKg: 70,
      note: '胸の日',
      sets: [set],
      createdAt: new Date('2026-02-13T09:00:00Z'),
      updatedAt: new Date('2026-02-13T10:00:00Z'),
    });

    return { session, set };
  }

  describe('toDTO', () => {
    it('WorkoutSessionをDTOに変換する', () => {
      const { session } = createSessionWithSet();
      const dto = WorkoutSessionMapper.toDTO(session);

      expect(dto.id).toBe('session-001');
      expect(dto.date).toBe('2026-02-13');
      expect(dto.bodyWeightKg).toBe(70);
      expect(dto.note).toBe('胸の日');
      expect(dto.sets).toHaveLength(1);
      expect(dto.totalCaloriesBurned).toBe(15.0);
      expect(dto.totalSets).toBe(1);
      expect(dto.totalVolume).toBe(600); // 10 × 60
      expect(dto.totalDurationMinutes).toBe(1.5);
      expect(dto.createdAt).toBe('2026-02-13T09:00:00.000Z');
      expect(dto.updatedAt).toBe('2026-02-13T10:00:00.000Z');
    });

    it('セットDTOにエクササイズ名を含める', () => {
      const { session } = createSessionWithSet();
      const exerciseNames = new Map([
        ['ex-bench-press', { name: 'Bench Press', nameJa: 'ベンチプレス' }],
      ]);

      const dto = WorkoutSessionMapper.toDTO(session, exerciseNames);

      expect(dto.sets[0].exerciseName).toBe('Bench Press');
      expect(dto.sets[0].exerciseNameJa).toBe('ベンチプレス');
    });

    it('エクササイズ名マップがない場合はundefined', () => {
      const { session } = createSessionWithSet();
      const dto = WorkoutSessionMapper.toDTO(session);

      expect(dto.sets[0].exerciseName).toBeUndefined();
      expect(dto.sets[0].exerciseNameJa).toBeUndefined();
    });
  });

  describe('setToDTO', () => {
    it('WorkoutSetをWorkoutSetDTOに変換する', () => {
      const set = WorkoutSet.reconstruct({
        id: UniqueId.from('set-001'),
        exerciseId: UniqueId.from('ex-squat'),
        setNumber: 2,
        reps: 8,
        weightKg: 100,
        durationMinutes: 2.0,
        caloriesBurned: 20.5,
      });

      const dto = WorkoutSessionMapper.setToDTO(set);

      expect(dto.id).toBe('set-001');
      expect(dto.exerciseId).toBe('ex-squat');
      expect(dto.setNumber).toBe(2);
      expect(dto.reps).toBe(8);
      expect(dto.weightKg).toBe(100);
      expect(dto.durationMinutes).toBe(2.0);
      expect(dto.caloriesBurned).toBe(20.5);
    });
  });
});
