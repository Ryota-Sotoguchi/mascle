// ========================================
// Unit Tests: GetWorkoutSessionsUseCase / GetWorkoutSessionByIdUseCase / DeleteWorkoutSessionUseCase
// ========================================
import { describe, it, expect, beforeEach } from 'vitest';
import { GetWorkoutSessionsUseCase } from '../use-cases/GetWorkoutSessionsUseCase.js';
import { GetWorkoutSessionByIdUseCase } from '../use-cases/GetWorkoutSessionByIdUseCase.js';
import { DeleteWorkoutSessionUseCase } from '../use-cases/DeleteWorkoutSessionUseCase.js';
import { WorkoutSet } from '../../domain/entities/WorkoutSet.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';
import { WorkoutSession } from '../../domain/entities/WorkoutSession.js';
import {
  InMemoryExerciseRepository,
  InMemoryWorkoutSessionRepository,
  createTestExercise,
  createTestSession,
} from './helpers.js';

// ========================================
// GetWorkoutSessionsUseCase
// ========================================
describe('GetWorkoutSessionsUseCase', () => {
  let sessionRepo: InMemoryWorkoutSessionRepository;
  let exerciseRepo: InMemoryExerciseRepository;
  let useCase: GetWorkoutSessionsUseCase;

  beforeEach(() => {
    sessionRepo = new InMemoryWorkoutSessionRepository();
    exerciseRepo = new InMemoryExerciseRepository();
    useCase = new GetWorkoutSessionsUseCase(sessionRepo, exerciseRepo);
  });

  it('全セッションをDTOリストで返す', async () => {
    sessionRepo.seed([
      createTestSession({ id: 'session-1', userId: 'user-001', date: new Date('2026-02-10') }),
      createTestSession({ id: 'session-2', userId: 'user-001', date: new Date('2026-02-13') }),
    ]);

    const result = await useCase.execute('user-001');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('session-1');
    expect(result[1].id).toBe('session-2');
  });

  it('日付範囲でフィルタリングする', async () => {
    sessionRepo.seed([
      createTestSession({ id: 'session-1', userId: 'user-001', date: new Date('2026-02-01') }),
      createTestSession({ id: 'session-2', userId: 'user-001', date: new Date('2026-02-10') }),
      createTestSession({ id: 'session-3', userId: 'user-001', date: new Date('2026-02-20') }),
    ]);

    const result = await useCase.execute('user-001', '2026-02-05', '2026-02-15');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('session-2');
  });

  it('セットにエクササイズ名を含める', async () => {
    const exercise = createTestExercise({ id: 'ex-bench', name: 'Bench Press', nameJa: 'ベンチプレス' });
    exerciseRepo.seed([exercise]);

    const session = createTestSession({ id: 'session-1', userId: 'user-001' });
    const set = WorkoutSet.reconstruct({
      id: UniqueId.from('set-1'),
      exerciseId: UniqueId.from('ex-bench'),
      setNumber: 1,
      reps: 10,
      weightKg: 60,
      durationMinutes: 1.5,
      caloriesBurned: 15.0,
    });
    session.addSet(set);
    sessionRepo.seed([session]);

    const result = await useCase.execute('user-001');
    expect(result[0].sets[0].exerciseName).toBe('Bench Press');
    expect(result[0].sets[0].exerciseNameJa).toBe('ベンチプレス');
  });

  it('セッションがない場合は空配列', async () => {
    const result = await useCase.execute('user-001');
    expect(result).toEqual([]);
  });
});

// ========================================
// GetWorkoutSessionByIdUseCase
// ========================================
describe('GetWorkoutSessionByIdUseCase', () => {
  let sessionRepo: InMemoryWorkoutSessionRepository;
  let exerciseRepo: InMemoryExerciseRepository;
  let useCase: GetWorkoutSessionByIdUseCase;

  beforeEach(() => {
    sessionRepo = new InMemoryWorkoutSessionRepository();
    exerciseRepo = new InMemoryExerciseRepository();
    useCase = new GetWorkoutSessionByIdUseCase(sessionRepo, exerciseRepo);
  });

  it('IDでセッションを取得してDTOで返す', async () => {
    sessionRepo.seed([
      createTestSession({ id: 'session-1', bodyWeightKg: 72 }),
    ]);

    const result = await useCase.execute('session-1');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('session-1');
    expect(result!.bodyWeightKg).toBe(72);
  });

  it('存在しないIDの場合はnullを返す', async () => {
    const result = await useCase.execute('non-existent');
    expect(result).toBeNull();
  });

  it('エクササイズ名がセットに含まれる', async () => {
    exerciseRepo.seed([
      createTestExercise({ id: 'ex-squat', name: 'Squat', nameJa: 'スクワット' }),
    ]);

    const session = createTestSession({ id: 'session-1' });
    session.addSet(WorkoutSet.reconstruct({
      id: UniqueId.from('set-1'),
      exerciseId: UniqueId.from('ex-squat'),
      setNumber: 1,
      reps: 5,
      weightKg: 100,
      durationMinutes: 2.0,
      caloriesBurned: 20.0,
    }));
    sessionRepo.seed([session]);

    const result = await useCase.execute('session-1');
    expect(result!.sets[0].exerciseName).toBe('Squat');
    expect(result!.sets[0].exerciseNameJa).toBe('スクワット');
  });
});

// ========================================
// DeleteWorkoutSessionUseCase
// ========================================
describe('DeleteWorkoutSessionUseCase', () => {
  let sessionRepo: InMemoryWorkoutSessionRepository;
  let useCase: DeleteWorkoutSessionUseCase;

  beforeEach(() => {
    sessionRepo = new InMemoryWorkoutSessionRepository();
    useCase = new DeleteWorkoutSessionUseCase(sessionRepo);
  });

  it('セッションを削除する', async () => {
    sessionRepo.seed([
      createTestSession({ id: 'session-1' }),
      createTestSession({ id: 'session-2' }),
    ]);

    await useCase.execute('session-1');

    const remaining = sessionRepo.getAll();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id.value).toBe('session-2');
  });

  it('存在しないIDでもエラーにならない', async () => {
    await expect(useCase.execute('non-existent')).resolves.not.toThrow();
  });
});
