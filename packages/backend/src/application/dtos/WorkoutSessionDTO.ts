// ========================================
// DTOs: WorkoutSession
// ========================================

export interface WorkoutSetDTO {
  id: string;
  exerciseId: string;
  exerciseName?: string;
  exerciseNameJa?: string;
  setNumber: number;
  reps: number;
  weightKg: number;        // 重量(kg) or 有酸素時は傾斜/負荷(%)
  durationMinutes: number;
  caloriesBurned: number;
  speedKmh: number;        // 有酸素種目の速度 (km/h), それ以外は 0
}

export interface WorkoutSessionDTO {
  id: string;
  date: string;
  bodyWeightKg: number;
  note?: string;
  sets: WorkoutSetDTO[];
  totalCaloriesBurned: number;
  totalSets: number;
  totalVolume: number;
  totalDurationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkoutSessionDTO {
  userId: string;
  date: string;
  bodyWeightKg: number;
  note?: string;
}

export interface AddWorkoutSetDTO {
  sessionId: string;
  exerciseId: string;
  reps: number;
  weightKg: number;      // 重量(kg) or 有酸素時は傾斜/負荷(%)
  speedKmh?: number;     // 有酸素種目の速度 (km/h)
  durationMinutes?: number;
  restSeconds?: number;
}

export interface CalorieEstimateDTO {
  exerciseId: string;
  bodyWeightKg: number;
  durationMinutes: number;
  estimatedCalories: number;
}
