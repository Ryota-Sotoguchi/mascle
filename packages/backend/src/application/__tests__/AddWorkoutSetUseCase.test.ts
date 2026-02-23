// ========================================
// Unit Test: AddWorkoutSetUseCase
// ========================================
import { describe, it, expect, beforeEach } from 'vitest';
import { AddWorkoutSetUseCase } from '../use-cases/AddWorkoutSetUseCase.js';
import {
  InMemoryExerciseRepository,
  InMemoryWorkoutSessionRepository,
  createTestExercise,
  createTestSession,
} from './helpers.js';

describe('AddWorkoutSetUseCase', () => {
  let sessionRepo: InMemoryWorkoutSessionRepository;
  let exerciseRepo: InMemoryExerciseRepository;
  let useCase: AddWorkoutSetUseCase;

  beforeEach(() => {
    sessionRepo = new InMemoryWorkoutSessionRepository();
    exerciseRepo = new InMemoryExerciseRepository();
    useCase = new AddWorkoutSetUseCase(sessionRepo, exerciseRepo);
  });

  it('セッションにセットを追加する', async () => {
    const exercise = createTestExercise({ id: 'ex-bench', met: 6.0 });
    exerciseRepo.seed([exercise]);
    sessionRepo.seed([createTestSession({ id: 'session-1', bodyWeightKg: 70 })]);

    const result = await useCase.execute({
      sessionId: 'session-1',
      exerciseId: 'ex-bench',
      reps: 10,
      weightKg: 60,
    });

    expect(result.sets).toHaveLength(1);
    expect(result.sets[0].exerciseId).toBe('ex-bench');
    expect(result.sets[0].reps).toBe(10);
    expect(result.sets[0].weightKg).toBe(60);
    expect(result.sets[0].setNumber).toBe(1);
  });

  it('カロリーが自動計算される', async () => {
    const exercise = createTestExercise({ id: 'ex-bench', met: 6.0 });
    exerciseRepo.seed([exercise]);
    sessionRepo.seed([createTestSession({ id: 'session-1', bodyWeightKg: 70 })]);

    const result = await useCase.execute({
      sessionId: 'session-1',
      exerciseId: 'ex-bench',
      reps: 10,
      weightKg: 60,
    });

    expect(result.sets[0].caloriesBurned).toBeGreaterThan(0);
    expect(result.totalCaloriesBurned).toBeGreaterThan(0);
  });

  it('durationMinutesを指定した場合はその値を使用する', async () => {
    const exercise = createTestExercise({ id: 'ex-bench', met: 6.0 });
    exerciseRepo.seed([exercise]);
    sessionRepo.seed([createTestSession({ id: 'session-1', bodyWeightKg: 70 })]);

    const result = await useCase.execute({
      sessionId: 'session-1',
      exerciseId: 'ex-bench',
      reps: 10,
      weightKg: 60,
      durationMinutes: 5.0,
    });

    expect(result.sets[0].durationMinutes).toBe(5.0);
  });

  it('durationMinutes未指定の場合は自動推定される', async () => {
    const exercise = createTestExercise({ id: 'ex-bench', met: 6.0 });
    exerciseRepo.seed([exercise]);
    sessionRepo.seed([createTestSession({ id: 'session-1', bodyWeightKg: 70 })]);

    const result = await useCase.execute({
      sessionId: 'session-1',
      exerciseId: 'ex-bench',
      reps: 10,
      weightKg: 60,
    });

    // 10reps × 4秒 + 60秒rest = 100秒 ≈ 1.67分
    expect(result.sets[0].durationMinutes).toBeCloseTo(1.67, 1);
  });

  it('セット番号が自動採番される', async () => {
    const exercise = createTestExercise({ id: 'ex-bench', met: 6.0 });
    exerciseRepo.seed([exercise]);
    sessionRepo.seed([createTestSession({ id: 'session-1', bodyWeightKg: 70 })]);

    await useCase.execute({
      sessionId: 'session-1',
      exerciseId: 'ex-bench',
      reps: 10,
      weightKg: 60,
    });

    const result = await useCase.execute({
      sessionId: 'session-1',
      exerciseId: 'ex-bench',
      reps: 8,
      weightKg: 65,
    });

    expect(result.sets[0].setNumber).toBe(1);
    expect(result.sets[1].setNumber).toBe(2);
  });

  it('エクササイズ名がDTOに含まれる', async () => {
    const exercise = createTestExercise({
      id: 'ex-bench',
      name: 'Bench Press',
      nameJa: 'ベンチプレス',
    });
    exerciseRepo.seed([exercise]);
    sessionRepo.seed([createTestSession({ id: 'session-1' })]);

    const result = await useCase.execute({
      sessionId: 'session-1',
      exerciseId: 'ex-bench',
      reps: 10,
      weightKg: 60,
    });

    expect(result.sets[0].exerciseName).toBe('Bench Press');
    expect(result.sets[0].exerciseNameJa).toBe('ベンチプレス');
  });

  it('存在しないセッションIDはエラー', async () => {
    exerciseRepo.seed([createTestExercise({ id: 'ex-bench' })]);

    await expect(
      useCase.execute({
        sessionId: 'non-existent',
        exerciseId: 'ex-bench',
        reps: 10,
        weightKg: 60,
      })
    ).rejects.toThrow('Session non-existent not found');
  });

  it('存在しないエクササイズIDはエラー', async () => {
    sessionRepo.seed([createTestSession({ id: 'session-1' })]);

    await expect(
      useCase.execute({
        sessionId: 'session-1',
        exerciseId: 'non-existent',
        reps: 10,
        weightKg: 60,
      })
    ).rejects.toThrow('Exercise non-existent not found');
  });
});
