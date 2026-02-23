// ========================================
// Unit Test: Exercise Entity
// ========================================
import { describe, it, expect } from 'vitest';
import { Exercise } from './Exercise.js';
import { UniqueId } from '../value-objects/UniqueId.js';
import { METValue } from '../value-objects/METValue.js';

describe('Exercise', () => {
  describe('create', () => {
    it('新しいエクササイズを正しく生成する', () => {
      const exercise = Exercise.create({
        name: 'Bench Press',
        nameJa: 'ベンチプレス',
        muscleGroup: 'chest',
        met: 6.0,
        description: '大胸筋を鍛える',
      });

      expect(exercise.name).toBe('Bench Press');
      expect(exercise.nameJa).toBe('ベンチプレス');
      expect(exercise.muscleGroup).toBe('chest');
      expect(exercise.met.value).toBe(6.0);
      expect(exercise.description).toBe('大胸筋を鍛える');
      expect(exercise.id).toBeDefined();
      expect(exercise.id.value).toMatch(/^[0-9a-f-]+$/i);
    });

    it('descriptionなしで生成できる', () => {
      const exercise = Exercise.create({
        name: 'Push Up',
        nameJa: '腕立て伏せ',
        muscleGroup: 'chest',
        met: 3.8,
      });

      expect(exercise.description).toBeUndefined();
    });

    it('すべての筋肉グループで生成できる', () => {
      const groups = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full_body', 'cardio'] as const;
      for (const group of groups) {
        const exercise = Exercise.create({
          name: 'Test',
          nameJa: 'テスト',
          muscleGroup: group,
          met: 5.0,
        });
        expect(exercise.muscleGroup).toBe(group);
      }
    });
  });

  describe('reconstruct', () => {
    it('既存のプロパティからエクササイズを復元する', () => {
      const id = UniqueId.from('ex-bench-press');
      const met = METValue.create(6.0);

      const exercise = Exercise.reconstruct({
        id,
        name: 'Bench Press',
        nameJa: 'ベンチプレス',
        muscleGroup: 'chest',
        met,
        description: '大胸筋を鍛える',
      });

      expect(exercise.id.value).toBe('ex-bench-press');
      expect(exercise.name).toBe('Bench Press');
      expect(exercise.met.value).toBe(6.0);
    });
  });

  describe('calculateCalories', () => {
    it('MET値ベースでカロリーを計算する', () => {
      const exercise = Exercise.create({
        name: 'Bench Press',
        nameJa: 'ベンチプレス',
        muscleGroup: 'chest',
        met: 6.0,
      });

      // 6.0 × 70 × (30/60) × 1.05 = 220.5
      const calories = exercise.calculateCalories(70, 30);
      expect(calories).toBe(220.5);
    });

    it('体重0kgの場合はカロリーが0', () => {
      const exercise = Exercise.create({
        name: 'Squat',
        nameJa: 'スクワット',
        muscleGroup: 'legs',
        met: 6.0,
      });

      const calories = exercise.calculateCalories(0, 30);
      expect(calories).toBe(0);
    });
  });
});
