// ========================================
// Frontend: API Types (mirrors backend DTOs)
// ========================================

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'full_body'
  | 'cardio';

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: '胸',
  back: '背中',
  shoulders: '肩',
  arms: '腕',
  legs: '脚',
  core: '体幹',
  full_body: '全身',
  cardio: '有酸素',
};

/**
 * reps_weight : レップ + 重量
 * reps_only   : レップのみ（自重種目）
 * duration    : 秒数入力（プランク等のホールド）
 * cardio      : 分入力 + 傾斜/負荷％（有酸素マシン）
 */
export type InputType = 'reps_weight' | 'reps_only' | 'duration' | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  nameJa: string;
  muscleGroup: MuscleGroup;
  met: number;
  description?: string;
  inputType: InputType;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  exerciseName?: string;
  exerciseNameJa?: string;
  setNumber: number;
  reps: number;
  weightKg: number;      // 重量(kg) or 有酸素時は傾斜/負荷(%)
  durationMinutes: number;
  caloriesBurned: number;
  speedKmh: number;      // 有酸素種目の速度 (km/h), それ以外は 0
}

export interface WorkoutSession {
  id: string;
  date: string;
  bodyWeightKg: number;
  note?: string;
  sets: WorkoutSet[];
  totalCaloriesBurned: number;
  totalSets: number;
  totalVolume: number;
  totalDurationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkoutSessionInput {
  date: string;
  bodyWeightKg: number;
  note?: string;
}

export interface AddWorkoutSetInput {
  exerciseId: string;
  reps: number;
  weightKg: number;      // 重量(kg) or 有酸素時は傾斜/負荷(%)
  speedKmh?: number;     // 有酸素種目の速度 (km/h)
  durationMinutes?: number;
  restSeconds?: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
