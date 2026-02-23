// ========================================
// Unit Test: WorkoutSession Aggregate Root
// ========================================
import { describe, it, expect } from 'vitest';
import { WorkoutSession } from './WorkoutSession.js';
import { WorkoutSet } from './WorkoutSet.js';
import { UniqueId } from '../value-objects/UniqueId.js';

describe('WorkoutSession', () => {
  describe('create', () => {
    it('有効なパラメータでセッションを生成する', () => {
      const session = WorkoutSession.create({
        userId: UniqueId.from('user-test'),
        date: new Date('2026-02-13'),
        bodyWeightKg: 70,
        note: '胸の日',
      });

      expect(session.date).toEqual(new Date('2026-02-13'));
      expect(session.bodyWeightKg).toBe(70);
      expect(session.note).toBe('胸の日');
      expect(session.sets).toHaveLength(0);
      expect(session.id).toBeDefined();
      expect(session.createdAt).toBeDefined();
      expect(session.updatedAt).toBeDefined();
    });

    it('メモなしでも生成できる', () => {
      const session = WorkoutSession.create({
        userId: UniqueId.from('user-test'),
        date: new Date('2026-02-13'),
        bodyWeightKg: 65,
      });

      expect(session.note).toBeUndefined();
    });

    it('体重が0以下はエラー', () => {
      expect(() =>
        WorkoutSession.create({
          userId: UniqueId.from('user-test'),
          date: new Date('2026-02-13'),
          bodyWeightKg: 0,
        })
      ).toThrow('Body weight must be positive');

      expect(() =>
        WorkoutSession.create({
          userId: UniqueId.from('user-test'),
          date: new Date('2026-02-13'),
          bodyWeightKg: -10,
        })
      ).toThrow('Body weight must be positive');
    });
  });

  describe('addSet / removeSet', () => {
    it('セットを追加できる', () => {
      const session = WorkoutSession.create({
        userId: UniqueId.from('user-test'),
        date: new Date('2026-02-13'),
        bodyWeightKg: 70,
      });

      const set = WorkoutSet.create({
        exerciseId: UniqueId.from('ex-bench-press'),
        setNumber: 1,
        reps: 10,
        weightKg: 60,
        durationMinutes: 1.5,
        caloriesBurned: 15.0,
      });

      session.addSet(set);
      expect(session.sets).toHaveLength(1);
      expect(session.sets[0].exerciseId.value).toBe('ex-bench-press');
    });

    it('セットを追加するとupdatedAtが更新される', () => {
      const session = WorkoutSession.create({
        userId: UniqueId.from('user-test'),
        date: new Date('2026-02-13'),
        bodyWeightKg: 70,
      });
      const originalUpdatedAt = session.updatedAt;

      // 微小な遅延でupdatedAtの変化を確認
      const set = WorkoutSet.create({
        exerciseId: UniqueId.from('ex-squat'),
        setNumber: 1,
        reps: 5,
        weightKg: 100,
        durationMinutes: 2.0,
        caloriesBurned: 20.0,
      });

      session.addSet(set);
      expect(session.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('セットを削除できる', () => {
      const session = WorkoutSession.create({
        userId: UniqueId.from('user-test'),
        date: new Date('2026-02-13'),
        bodyWeightKg: 70,
      });

      const set = WorkoutSet.create({
        exerciseId: UniqueId.from('ex-bench-press'),
        setNumber: 1,
        reps: 10,
        weightKg: 60,
        durationMinutes: 1.5,
        caloriesBurned: 15.0,
      });

      session.addSet(set);
      expect(session.sets).toHaveLength(1);

      session.removeSet(set.id);
      expect(session.sets).toHaveLength(0);
    });

    it('存在しないセットを削除するとエラー', () => {
      const session = WorkoutSession.create({
        userId: UniqueId.from('user-test'),
        date: new Date('2026-02-13'),
        bodyWeightKg: 70,
      });

      const fakeId = UniqueId.from('non-existent');
      expect(() => session.removeSet(fakeId)).toThrow('not found');
    });
  });

  describe('集計プロパティ', () => {
    function createSessionWithSets() {
      const session = WorkoutSession.create({
        userId: UniqueId.from('user-test'),
        date: new Date('2026-02-13'),
        bodyWeightKg: 70,
      });

      session.addSet(WorkoutSet.create({
        exerciseId: UniqueId.from('ex-bench-press'),
        setNumber: 1,
        reps: 10,
        weightKg: 60,
        durationMinutes: 1.5,
        caloriesBurned: 15.0,
      }));

      session.addSet(WorkoutSet.create({
        exerciseId: UniqueId.from('ex-bench-press'),
        setNumber: 2,
        reps: 8,
        weightKg: 65,
        durationMinutes: 1.5,
        caloriesBurned: 15.0,
      }));

      session.addSet(WorkoutSet.create({
        exerciseId: UniqueId.from('ex-squat'),
        setNumber: 3,
        reps: 5,
        weightKg: 100,
        durationMinutes: 2.0,
        caloriesBurned: 20.0,
      }));

      return session;
    }

    it('totalCaloriesBurnedが全セットの合計', () => {
      const session = createSessionWithSets();
      // 15.0 + 15.0 + 20.0 = 50.0
      expect(session.totalCaloriesBurned).toBe(50);
    });

    it('totalSetsがセット数を返す', () => {
      const session = createSessionWithSets();
      expect(session.totalSets).toBe(3);
    });

    it('totalVolumeがレップ×重量の合計', () => {
      const session = createSessionWithSets();
      // (10×60) + (8×65) + (5×100) = 600 + 520 + 500 = 1620
      expect(session.totalVolume).toBe(1620);
    });

    it('totalDurationMinutesが合計時間', () => {
      const session = createSessionWithSets();
      // 1.5 + 1.5 + 2.0 = 5.0
      expect(session.totalDurationMinutes).toBe(5.0);
    });

    it('セットがない場合は全て0', () => {
      const session = WorkoutSession.create({
        userId: UniqueId.from('user-test'),
        date: new Date('2026-02-13'),
        bodyWeightKg: 70,
      });

      expect(session.totalCaloriesBurned).toBe(0);
      expect(session.totalSets).toBe(0);
      expect(session.totalVolume).toBe(0);
      expect(session.totalDurationMinutes).toBe(0);
    });
  });

  describe('updateNote / updateBodyWeight', () => {
    it('メモを更新できる', () => {
      const session = WorkoutSession.create({
        userId: UniqueId.from('user-test'),
        date: new Date('2026-02-13'),
        bodyWeightKg: 70,
        note: '元のメモ',
      });

      session.updateNote('更新後のメモ');
      expect(session.note).toBe('更新後のメモ');
    });

    it('体重を更新できる', () => {
      const session = WorkoutSession.create({
        userId: UniqueId.from('user-test'),
        date: new Date('2026-02-13'),
        bodyWeightKg: 70,
      });

      session.updateBodyWeight(72.5);
      expect(session.bodyWeightKg).toBe(72.5);
    });

    it('体重を0以下に更新するとエラー', () => {
      const session = WorkoutSession.create({
        userId: UniqueId.from('user-test'),
        date: new Date('2026-02-13'),
        bodyWeightKg: 70,
      });

      expect(() => session.updateBodyWeight(0)).toThrow('Body weight must be positive');
      expect(() => session.updateBodyWeight(-5)).toThrow('Body weight must be positive');
    });
  });

  describe('reconstruct', () => {
    it('既存のプロパティからセッションを復元する', () => {
      const id = UniqueId.from('session-001');
      const set = WorkoutSet.reconstruct({
        id: UniqueId.from('set-001'),
        exerciseId: UniqueId.from('ex-squat'),
        setNumber: 1,
        reps: 10,
        weightKg: 80,
        durationMinutes: 1.5,
        caloriesBurned: 15.0,
      });

      const session = WorkoutSession.reconstruct({
        id,
        userId: UniqueId.from('user-test'),
        date: new Date('2026-01-01'),
        bodyWeightKg: 68,
        note: 'テスト',
        sets: [set],
        createdAt: new Date('2026-01-01T09:00:00'),
        updatedAt: new Date('2026-01-01T10:00:00'),
      });

      expect(session.id.value).toBe('session-001');
      expect(session.sets).toHaveLength(1);
      expect(session.bodyWeightKg).toBe(68);
      expect(session.note).toBe('テスト');
    });
  });
});
