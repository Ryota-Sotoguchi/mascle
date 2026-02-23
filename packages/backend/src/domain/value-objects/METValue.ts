// ========================================
// Value Object: METValue (Metabolic Equivalent of Task)
// ========================================

export class METValue {
  private constructor(public readonly value: number) {
    if (value <= 0) {
      throw new Error('MET value must be positive');
    }
  }

  static create(value: number): METValue {
    return new METValue(value);
  }

  /**
   * カロリー計算: MET × 体重(kg) × 時間(h) × 1.05
   */
  calculateCalories(bodyWeightKg: number, durationMinutes: number): number {
    const durationHours = durationMinutes / 60;
    return Math.round(this.value * bodyWeightKg * durationHours * 1.05 * 10) / 10;
  }

  equals(other: METValue): boolean {
    return this.value === other.value;
  }
}
