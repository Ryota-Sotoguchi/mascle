// ========================================
// Entity: Exercise (エクササイズマスタ)
// ========================================
import { UniqueId } from '../value-objects/UniqueId.js';
import { METValue } from '../value-objects/METValue.js';

export type MuscleGroup =
  | 'chest'     // 胸
  | 'back'      // 背中
  | 'shoulders' // 肩
  | 'arms'      // 腕
  | 'legs'      // 脚
  | 'core'      // 体幹
  | 'full_body' // 全身
  | 'cardio';   // 有酸素

/**
 * reps_weight : レップ数 + 重量（標準的なウエイトトレーニング）
 * reps_only   : レップ数のみ（自重種目）
 * duration    : 時間のみ・秒入力（プランク等の静的ホールド）
 * cardio      : 時間（分）+ 傾斜% （有酸素マシン。傾斜は weightKg に格納）
 */
export type InputType = 'reps_weight' | 'reps_only' | 'duration' | 'cardio';

export interface ExerciseProps {
  id: UniqueId;
  name: string;
  nameJa: string;
  muscleGroup: MuscleGroup;
  met: METValue;
  description?: string;
  inputType?: InputType;
}

export class Exercise {
  private constructor(private readonly props: ExerciseProps) {}

  static create(params: {
    name: string;
    nameJa: string;
    muscleGroup: MuscleGroup;
    met: number;
    description?: string;
    inputType?: InputType;
  }): Exercise {
    return new Exercise({
      id: UniqueId.create(),
      name: params.name,
      nameJa: params.nameJa,
      muscleGroup: params.muscleGroup,
      met: METValue.create(params.met),
      description: params.description,
      inputType: params.inputType ?? 'reps_weight',
    });
  }

  static reconstruct(props: ExerciseProps): Exercise {
    return new Exercise(props);
  }

  get id(): UniqueId { return this.props.id; }
  get name(): string { return this.props.name; }
  get nameJa(): string { return this.props.nameJa; }
  get muscleGroup(): MuscleGroup { return this.props.muscleGroup; }
  get met(): METValue { return this.props.met; }
  get description(): string | undefined { return this.props.description; }
  get inputType(): InputType { return this.props.inputType ?? 'reps_weight'; }

  calculateCalories(bodyWeightKg: number, durationMinutes: number): number {
    return this.props.met.calculateCalories(bodyWeightKg, durationMinutes);
  }
}
