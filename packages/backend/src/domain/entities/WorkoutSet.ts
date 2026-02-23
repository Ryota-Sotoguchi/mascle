// ========================================
// Entity: WorkoutSet (1セットの記録)
// ========================================
import { UniqueId } from '../value-objects/UniqueId.js';

export interface WorkoutSetProps {
  id: UniqueId;
  exerciseId: UniqueId;
  setNumber: number;
  reps: number;
  weightKg: number;        // 重量(kg) or 有酸素時は傾斜/負荷(%)
  durationMinutes: number;
  caloriesBurned: number;
  speedKmh?: number;       // 有酸素種目の速度 (km/h), それ以外は 0
}

export class WorkoutSet {
  private constructor(private readonly props: WorkoutSetProps) {}

  static create(params: {
    exerciseId: UniqueId;
    setNumber: number;
    reps: number;
    weightKg: number;
    durationMinutes: number;
    caloriesBurned: number;
    speedKmh?: number;
  }): WorkoutSet {
    if (params.setNumber < 1) throw new Error('Set number must be >= 1');
    if (params.reps < 0) throw new Error('Reps must be >= 0');
    if (params.weightKg < 0) throw new Error('Weight must be >= 0');
    if (params.durationMinutes < 0) throw new Error('Duration must be >= 0');

    return new WorkoutSet({
      id: UniqueId.create(),
      ...params,
      speedKmh: params.speedKmh ?? 0,
    });
  }

  static reconstruct(props: WorkoutSetProps): WorkoutSet {
    return new WorkoutSet(props);
  }

  get id(): UniqueId { return this.props.id; }
  get exerciseId(): UniqueId { return this.props.exerciseId; }
  get setNumber(): number { return this.props.setNumber; }
  get reps(): number { return this.props.reps; }
  get weightKg(): number { return this.props.weightKg; }
  get durationMinutes(): number { return this.props.durationMinutes; }
  get caloriesBurned(): number { return this.props.caloriesBurned; }
  get speedKmh(): number { return this.props.speedKmh ?? 0; }
}
