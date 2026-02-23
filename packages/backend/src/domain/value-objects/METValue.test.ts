// ========================================
// Unit Test: METValue Value Object
// ========================================
import { describe, it, expect } from 'vitest';
import { METValue } from './METValue.js';

describe('METValue', () => {
  describe('create', () => {
    it('正の値でMETValueを生成できる', () => {
      const met = METValue.create(6.0);
      expect(met.value).toBe(6.0);
    });

    it('0以下の値はエラーになる', () => {
      expect(() => METValue.create(0)).toThrow('MET value must be positive');
      expect(() => METValue.create(-1)).toThrow('MET value must be positive');
    });

    it('小数値でもMETValueを生成できる', () => {
      const met = METValue.create(3.5);
      expect(met.value).toBe(3.5);
    });
  });

  describe('calculateCalories', () => {
    it('MET × 体重(kg) × 時間(h) × 1.05 で計算される', () => {
      const met = METValue.create(6.0);
      // 6.0 × 70 × (30/60) × 1.05 = 220.5
      const calories = met.calculateCalories(70, 30);
      expect(calories).toBe(220.5);
    });

    it('1分間の場合の計算', () => {
      const met = METValue.create(6.0);
      // 6.0 × 70 × (1/60) × 1.05 = 7.35
      const calories = met.calculateCalories(70, 1);
      expect(calories).toBe(7.4); // 四捨五入で7.4
    });

    it('0分の場合はカロリーが0になる', () => {
      const met = METValue.create(6.0);
      const calories = met.calculateCalories(70, 0);
      expect(calories).toBe(0);
    });

    it('体重が軽い場合はカロリーが少ない', () => {
      const met = METValue.create(6.0);
      const caloriesLight = met.calculateCalories(50, 30);
      const caloriesHeavy = met.calculateCalories(80, 30);
      expect(caloriesLight).toBeLessThan(caloriesHeavy);
    });

    it('MET値が高い種目ほどカロリーが多い', () => {
      const metLow = METValue.create(3.0);
      const metHigh = METValue.create(8.0);
      const caloriesLow = metLow.calculateCalories(70, 30);
      const caloriesHigh = metHigh.calculateCalories(70, 30);
      expect(caloriesLow).toBeLessThan(caloriesHigh);
    });
  });

  describe('equals', () => {
    it('同じ値のMETValueは等しい', () => {
      const met1 = METValue.create(6.0);
      const met2 = METValue.create(6.0);
      expect(met1.equals(met2)).toBe(true);
    });

    it('異なる値のMETValueは等しくない', () => {
      const met1 = METValue.create(6.0);
      const met2 = METValue.create(8.0);
      expect(met1.equals(met2)).toBe(false);
    });
  });
});
