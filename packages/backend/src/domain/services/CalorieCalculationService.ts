// ========================================
// Domain Service: CalorieCalculationService
// ========================================
import { Exercise } from '../entities/Exercise.js';

export class CalorieCalculationService {
  /**
   * 消費カロリーを計算する
   *
   * 速度指定あり（speedKmh > 0）: ACSM 代謝公式を使用
   *   speed_mpm = speedKmh × (1000/60)            m/分
   *   grade     = inclinePct / 100                 傾斜の小数表記
   *   ランニング(≥8 km/h): VO2 = speed×0.2 + speed×grade×0.9 + 3.5
   *   ウォーキング(<8 km/h): VO2 = speed×0.1 + speed×grade×1.8 + 3.5
   *   adjustedMET = VO2 / 3.5
   *
   * 速度指定なし（speedKmh = 0）: 従来の簡易補正
   *   adjustedMET = baseMET + inclinePct × 0.5
   *
   * 負荷係数（ウェイト種目向け）
   *   loadFactor = 1 + min(重量 / 体重, 1.0) × 0.5
   */
  calculate(
    exercise: Exercise,
    bodyWeightKg: number,
    durationMinutes: number,
    weightKg: number = 0,
    inclinePct: number = 0,
    speedKmh: number = 0,
  ): number {
    let adjustedMet: number;
    if (speedKmh > 0) {
      // ACSM metabolic formula
      const speedMpm = speedKmh * (1000 / 60);
      const grade = inclinePct / 100;
      const isRunning = speedKmh >= 8;
      const hCoeff = isRunning ? 0.2 : 0.1;
      const vCoeff = isRunning ? 0.9 : 1.8;
      const vo2 = speedMpm * hCoeff + speedMpm * grade * vCoeff + 3.5;
      adjustedMet = vo2 / 3.5;
    } else {
      adjustedMet = exercise.met.value + inclinePct * 0.5;
    }
    const loadFactor = weightKg > 0 && bodyWeightKg > 0
      ? 1 + Math.min(weightKg / bodyWeightKg, 1.0) * 0.5
      : 1;
    const baseCal = adjustedMet * bodyWeightKg * (durationMinutes / 60) * 1.05;
    return Math.round(baseCal * loadFactor * 10) / 10;
  }

  /**
   * セットベースの推定消費時間(分)を計算する
   * 1repあたり約3-5秒 + レスト時間を考慮
   */
  estimateDurationFromSet(reps: number, restSeconds: number = 60): number {
    const repDuration = reps * 4; // 1repあたり4秒
    const totalSeconds = repDuration + restSeconds;
    return Math.round((totalSeconds / 60) * 100) / 100;
  }
}
