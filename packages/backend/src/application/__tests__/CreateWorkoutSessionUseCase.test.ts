// ========================================
// Unit Test: CreateWorkoutSessionUseCase
// ========================================
import { describe, it, expect, beforeEach } from 'vitest';
import { CreateWorkoutSessionUseCase } from '../use-cases/CreateWorkoutSessionUseCase.js';
import { InMemoryWorkoutSessionRepository } from './helpers.js';

describe('CreateWorkoutSessionUseCase', () => {
  let sessionRepo: InMemoryWorkoutSessionRepository;
  let useCase: CreateWorkoutSessionUseCase;

  beforeEach(() => {
    sessionRepo = new InMemoryWorkoutSessionRepository();
    useCase = new CreateWorkoutSessionUseCase(sessionRepo);
  });

  it('新しいワークアウトセッションを作成してDTOを返す', async () => {
    const result = await useCase.execute({
      userId: 'user-001',
      date: '2026-02-13',
      bodyWeightKg: 70,
      note: '胸と三頭',
    });

    expect(result.date).toBe('2026-02-13');
    expect(result.bodyWeightKg).toBe(70);
    expect(result.note).toBe('胸と三頭');
    expect(result.sets).toEqual([]);
    expect(result.totalCaloriesBurned).toBe(0);
    expect(result.totalSets).toBe(0);
    expect(result.id).toBeDefined();
  });

  it('リポジトリに保存される', async () => {
    await useCase.execute({
      userId: 'user-001',
      date: '2026-02-13',
      bodyWeightKg: 65,
    });

    const sessions = sessionRepo.getAll();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].bodyWeightKg).toBe(65);
  });

  it('体重0以下はエラー', async () => {
    await expect(
      useCase.execute({
        userId: 'user-001',
        date: '2026-02-13',
        bodyWeightKg: 0,
      })
    ).rejects.toThrow('Body weight must be positive');
  });
});
