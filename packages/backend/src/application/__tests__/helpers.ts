// ========================================
// Test Helpers: Mock Repositories
// ========================================
import type { IExerciseRepository } from '../../domain/repositories/IExerciseRepository.js';
import type { IWorkoutSessionRepository } from '../../domain/repositories/IWorkoutSessionRepository.js';
import { Exercise, type MuscleGroup } from '../../domain/entities/Exercise.js';
import { WorkoutSession } from '../../domain/entities/WorkoutSession.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';
import { METValue } from '../../domain/value-objects/METValue.js';

// ========================================
// InMemory Exercise Repository
// ========================================
export class InMemoryExerciseRepository implements IExerciseRepository {
  private exercises: Exercise[] = [];

  async findById(id: UniqueId): Promise<Exercise | null> {
    return this.exercises.find(e => e.id.equals(id)) ?? null;
  }

  async findAll(): Promise<Exercise[]> {
    return [...this.exercises];
  }

  async findByMuscleGroup(group: MuscleGroup): Promise<Exercise[]> {
    return this.exercises.filter(e => e.muscleGroup === group);
  }

  async save(exercise: Exercise): Promise<void> {
    this.exercises.push(exercise);
  }

  async delete(id: UniqueId): Promise<void> {
    this.exercises = this.exercises.filter(e => !e.id.equals(id));
  }

  // テスト用ヘルパー
  seed(exercises: Exercise[]): void {
    this.exercises = [...exercises];
  }

  getAll(): Exercise[] {
    return [...this.exercises];
  }
}

// ========================================
// InMemory WorkoutSession Repository
// ========================================
export class InMemoryWorkoutSessionRepository implements IWorkoutSessionRepository {
  private sessions: WorkoutSession[] = [];

  async findById(id: UniqueId): Promise<WorkoutSession | null> {
    return this.sessions.find(s => s.id.equals(id)) ?? null;
  }

  async findByUserId(userId: UniqueId): Promise<WorkoutSession[]> {
    return this.sessions.filter(s => s.userId.equals(userId));
  }

  async findByUserIdAndDateRange(userId: UniqueId, from: Date, to: Date): Promise<WorkoutSession[]> {
    return this.sessions.filter(s => {
      if (!s.userId.equals(userId)) return false;
      const date = s.date.getTime();
      return date >= from.getTime() && date <= to.getTime();
    });
  }

  async save(session: WorkoutSession): Promise<void> {
    this.sessions.push(session);
  }

  async update(session: WorkoutSession): Promise<void> {
    const index = this.sessions.findIndex(s => s.id.equals(session.id));
    if (index !== -1) {
      this.sessions[index] = session;
    }
  }

  async delete(id: UniqueId): Promise<void> {
    this.sessions = this.sessions.filter(s => !s.id.equals(id));
  }

  // テスト用ヘルパー
  seed(sessions: WorkoutSession[]): void {
    this.sessions = [...sessions];
  }

  getAll(): WorkoutSession[] {
    return [...this.sessions];
  }
}

// ========================================
// テストデータファクトリ
// ========================================
export function createTestExercise(overrides?: {
  id?: string;
  name?: string;
  nameJa?: string;
  muscleGroup?: MuscleGroup;
  met?: number;
  description?: string;
}): Exercise {
  return Exercise.reconstruct({
    id: UniqueId.from(overrides?.id ?? 'ex-bench-press'),
    name: overrides?.name ?? 'Bench Press',
    nameJa: overrides?.nameJa ?? 'ベンチプレス',
    muscleGroup: overrides?.muscleGroup ?? 'chest',
    met: METValue.create(overrides?.met ?? 6.0),
    description: overrides?.description,
  });
}

export function createTestSession(overrides?: {
  id?: string;
  userId?: string;
  date?: Date;
  bodyWeightKg?: number;
  note?: string;
}): WorkoutSession {
  return WorkoutSession.reconstruct({
    id: UniqueId.from(overrides?.id ?? 'session-001'),
    userId: UniqueId.from(overrides?.userId ?? 'user-001'),
    date: overrides?.date ?? new Date('2026-02-13'),
    bodyWeightKg: overrides?.bodyWeightKg ?? 70,
    note: overrides?.note,
    sets: [],
    createdAt: new Date('2026-02-13T09:00:00Z'),
    updatedAt: new Date('2026-02-13T09:00:00Z'),
  });
}
