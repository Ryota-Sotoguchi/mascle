// ========================================
// Unit Test: CalorieCalculationService
// ========================================
import { describe, it, expect } from 'vitest';
import { CalorieCalculationService } from './CalorieCalculationService.js';
import { Exercise } from '../entities/Exercise.js';

describe('CalorieCalculationService', () => {
  const service = new CalorieCalculationService();

  function createExercise(met: number): Exercise {
    return Exercise.create({
      name: 'Test Exercise',
      nameJa: 'テスト種目',
      muscleGroup: 'chest',
      met,
    });
  }

  describe('calculate', () => {
    it('MET × 体重 × 時間(h) × 1.05 で計算する（重量なし）', () => {
      const exercise = createExercise(6.0);
      // 6.0 × 70 × (30/60) × 1.05 = 220.5
      const calories = service.calculate(exercise, 70, 30);
      expect(calories).toBe(220.5);
    });

    it('高METの有酸素運動のカロリー計算', () => {
      const exercise = createExercise(11.0); // 縄跳び
      // 11.0 × 65 × (20/60) × 1.05 = 250.25
      const calories = service.calculate(exercise, 65, 20);
      expect(calories).toBe(250.3); // 小数第1位に丸め
    });

    it('0分の場合は0カロリー', () => {
      const exercise = createExercise(6.0);
      expect(service.calculate(exercise, 70, 0)).toBe(0);
    });

    it('重量による負荷係数が適用される', () => {
      const exercise = createExercise(6.0);
      // weightKg=60, bodyWeightKg=70: loadFactor = 1 + (60/70) × 0.5 ≈ 1.4286
      // baseCal = 6.0 × 70 × 0.5 × 1.05 = 220.5, result = 220.5 × 1.4286 ≈ 315.0
      const calories = service.calculate(exercise, 70, 30, 60);
      expect(calories).toBe(315.0);
    });

    it('重量が体重と同じ場合は係数1.5（最大値付近）', () => {
      const exercise = createExercise(6.0);
      // loadFactor = 1 + min(1, 1) × 0.5 = 1.5 → 220.5 × 1.5 = 330.75 → 330.8
      const calories = service.calculate(exercise, 70, 30, 70);
      expect(calories).toBe(330.8);
    });

    it('重量が体重を超えても係数は上限1.5でキャップされる', () => {
      const exercise = createExercise(6.0);
      const caloriesHeavy = service.calculate(exercise, 70, 30, 140);
      const caloriesCapped = service.calculate(exercise, 70, 30, 70);
      expect(caloriesHeavy).toBe(caloriesCapped);
    });

    it('傾斜5%を指定すると MET が +2.5 補正される', () => {
      const exercise = createExercise(8.0); // トレッドミル MET 8.0
      // adjustedMet = 8.0 + 5 × 0.5 = 10.5
      // 10.5 × 70 × (30/60) × 1.05 = 386.0 (approx)
      const withIncline = service.calculate(exercise, 70, 30, 0, 5);
      const withoutIncline = service.calculate(exercise, 70, 30, 0, 0);
      expect(withIncline).toBeGreaterThan(withoutIncline);
      // adjustedMet = 10.5 → 10.5 × 70 × 0.5 × 1.05 = 385.875 → 385.9
      expect(withIncline).toBe(385.9);
    });

    it('傾斜0%は傾斜なしと同じ結果', () => {
      const exercise = createExercise(8.0);
      expect(service.calculate(exercise, 70, 30, 0, 0)).toBe(
        service.calculate(exercise, 70, 30),
      );
    });
    it('速度10km/h(ランニング)+傾斜5% → ACSM公式で計算される', () => {
      const exercise = createExercise(8.0);
      // speedMpm = 10×1000/60 = 166.667, grade = 0.05
      // VO2 = 166.667×0.2 + 166.667×0.05×0.9 + 3.5 = 33.333 + 7.5 + 3.5 = 44.333
      // MET = 44.333/3.5 = 12.667
      // cal = 12.667 × 70 × 0.5 × 1.05 = 465.5
      const cal = service.calculate(exercise, 70, 30, 0, 5, 10);
      expect(cal).toBe(465.5);
    });

    it('速度5km/h(ウォーキング)+傾斜5% → ACSM歩行公式で計算される', () => {
      const exercise = createExercise(4.0);
      // speedMpm = 5×1000/60 = 83.333, grade = 0.05
      // VO2 = 83.333×0.1 + 83.333×0.05×1.8 + 3.5 = 8.333 + 7.5 + 3.5 = 19.333
      // MET = 19.333/3.5 = 5.524
      // cal = 5.524 × 70 × 0.5 × 1.05 = 203.0
      const cal = service.calculate(exercise, 70, 30, 0, 5, 5);
      expect(cal).toBe(203.0);
    });

    it('速度指定ありの場合、速度が高いほどカロリーが増える', () => {
      const exercise = createExercise(8.0);
      const slow = service.calculate(exercise, 70, 30, 0, 0, 8);   // 8 km/h
      const fast = service.calculate(exercise, 70, 30, 0, 0, 12);  // 12 km/h
      expect(fast).toBeGreaterThan(slow);
    });  });

  describe('estimateDurationFromSet', () => {
    it('レップ数からセット所要時間を推定する（デフォルト休憩60秒）', () => {
      // 10reps × 4秒 = 40秒 + 60秒rest = 100秒 ≈ 1.67分
      const duration = service.estimateDurationFromSet(10);
      expect(duration).toBeCloseTo(1.67, 2);
    });

    it('カスタム休憩時間で推定する', () => {
      // 8reps × 4秒 = 32秒 + 90秒rest = 122秒 ≈ 2.03分
      const duration = service.estimateDurationFromSet(8, 90);
      expect(duration).toBeCloseTo(2.03, 2);
    });

    it('0レップの場合は休憩時間のみ', () => {
      // 0reps × 4秒 = 0秒 + 60秒rest = 60秒 = 1分
      const duration = service.estimateDurationFromSet(0);
      expect(duration).toBe(1);
    });

    it('休憩0秒の場合はレップ時間のみ', () => {
      // 15reps × 4秒 = 60秒 + 0秒rest = 60秒 = 1分
      const duration = service.estimateDurationFromSet(15, 0);
      expect(duration).toBe(1);
    });
  });
});
