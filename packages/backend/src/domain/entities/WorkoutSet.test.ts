// ========================================
// Unit Test: WorkoutSet Entity
// ========================================
import { describe, it, expect } from 'vitest';
import { WorkoutSet } from './WorkoutSet.js';
import { UniqueId } from '../value-objects/UniqueId.js';

describe('WorkoutSet', () => {
  const validParams = () => ({
    exerciseId: UniqueId.from('ex-bench-press'),
    setNumber: 1,
    reps: 10,
    weightKg: 60,
    durationMinutes: 1.5,
    caloriesBurned: 15.2,
  });

  describe('create', () => {
    it('有効なパラメータでセットを生成する', () => {
      const set = WorkoutSet.create(validParams());

      expect(set.exerciseId.value).toBe('ex-bench-press');
      expect(set.setNumber).toBe(1);
      expect(set.reps).toBe(10);
      expect(set.weightKg).toBe(60);
      expect(set.durationMinutes).toBe(1.5);
      expect(set.caloriesBurned).toBe(15.2);
      expect(set.id).toBeDefined();
    });

    it('レップ数0でもOK（レスト等）', () => {
      const set = WorkoutSet.create({ ...validParams(), reps: 0 });
      expect(set.reps).toBe(0);
    });

    it('重量0kgでもOK（自重トレ）', () => {
      const set = WorkoutSet.create({ ...validParams(), weightKg: 0 });
      expect(set.weightKg).toBe(0);
    });

    it('時間0分でもOK', () => {
      const set = WorkoutSet.create({ ...validParams(), durationMinutes: 0 });
      expect(set.durationMinutes).toBe(0);
    });
  });

  describe('バリデーション', () => {
    it('セット番号が1未満はエラー', () => {
      expect(() =>
        WorkoutSet.create({ ...validParams(), setNumber: 0 })
      ).toThrow('Set number must be >= 1');
    });

    it('レップ数が負数はエラー', () => {
      expect(() =>
        WorkoutSet.create({ ...validParams(), reps: -1 })
      ).toThrow('Reps must be >= 0');
    });

    it('重量が負数はエラー', () => {
      expect(() =>
        WorkoutSet.create({ ...validParams(), weightKg: -1 })
      ).toThrow('Weight must be >= 0');
    });

    it('時間が負数はエラー', () => {
      expect(() =>
        WorkoutSet.create({ ...validParams(), durationMinutes: -1 })
      ).toThrow('Duration must be >= 0');
    });
  });

  describe('reconstruct', () => {
    it('既存のプロパティからセットを復元する', () => {
      const id = UniqueId.from('set-001');
      const exerciseId = UniqueId.from('ex-squat');

      const set = WorkoutSet.reconstruct({
        id,
        exerciseId,
        setNumber: 3,
        reps: 8,
        weightKg: 100,
        durationMinutes: 2.0,
        caloriesBurned: 20.5,
      });

      expect(set.id.value).toBe('set-001');
      expect(set.exerciseId.value).toBe('ex-squat');
      expect(set.setNumber).toBe(3);
      expect(set.reps).toBe(8);
      expect(set.weightKg).toBe(100);
    });
  });
});
