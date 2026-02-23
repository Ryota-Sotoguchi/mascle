// ========================================
// Aggregate Root: WorkoutSession (ワークアウトセッション)
// ========================================
import { UniqueId } from '../value-objects/UniqueId.js';
import { WorkoutSet } from './WorkoutSet.js';

export interface WorkoutSessionProps {
  id: UniqueId;
  userId: UniqueId;
  date: Date;
  bodyWeightKg: number;
  note?: string;
  sets: WorkoutSet[];
  createdAt: Date;
  updatedAt: Date;
}

export class WorkoutSession {
  private readonly props: WorkoutSessionProps;

  private constructor(props: WorkoutSessionProps) {
    this.props = { ...props };
  }

  static create(params: {
    userId: UniqueId;
    date: Date;
    bodyWeightKg: number;
    note?: string;
  }): WorkoutSession {
    if (params.bodyWeightKg <= 0) {
      throw new Error('Body weight must be positive');
    }

    const now = new Date();
    return new WorkoutSession({
      id: UniqueId.create(),
      userId: params.userId,
      date: params.date,
      bodyWeightKg: params.bodyWeightKg,
      note: params.note,
      sets: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(props: WorkoutSessionProps): WorkoutSession {
    return new WorkoutSession(props);
  }

  get id(): UniqueId { return this.props.id; }
  get userId(): UniqueId { return this.props.userId; }
  get date(): Date { return this.props.date; }
  get bodyWeightKg(): number { return this.props.bodyWeightKg; }
  get note(): string | undefined { return this.props.note; }
  get sets(): ReadonlyArray<WorkoutSet> { return this.props.sets; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  addSet(set: WorkoutSet): void {
    this.props.sets.push(set);
    this.props.updatedAt = new Date();
  }

  removeSet(setId: UniqueId): void {
    const index = this.props.sets.findIndex(s => s.id.equals(setId));
    if (index === -1) {
      throw new Error(`Set with id ${setId.value} not found`);
    }
    this.props.sets.splice(index, 1);
    this.props.updatedAt = new Date();
  }

  get totalCaloriesBurned(): number {
    return Math.round(
      this.props.sets.reduce((sum, set) => sum + set.caloriesBurned, 0) * 10
    ) / 10;
  }

  get totalSets(): number {
    return this.props.sets.length;
  }

  get totalVolume(): number {
    return this.props.sets.reduce(
      (sum, set) => sum + set.reps * set.weightKg,
      0
    );
  }

  get totalDurationMinutes(): number {
    return this.props.sets.reduce(
      (sum, set) => sum + set.durationMinutes,
      0
    );
  }

  updateNote(note: string): void {
    this.props.note = note;
    this.props.updatedAt = new Date();
  }

  updateBodyWeight(weightKg: number): void {
    if (weightKg <= 0) throw new Error('Body weight must be positive');
    this.props.bodyWeightKg = weightKg;
    this.props.updatedAt = new Date();
  }
}
