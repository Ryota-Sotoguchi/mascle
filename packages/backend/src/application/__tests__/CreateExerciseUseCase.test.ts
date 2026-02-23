// ========================================
// Unit Test: CreateExerciseUseCase
// ========================================
import { describe, it, expect, beforeEach } from 'vitest';
import { CreateExerciseUseCase } from '../use-cases/CreateExerciseUseCase.js';
import { InMemoryExerciseRepository } from './helpers.js';

describe('CreateExerciseUseCase', () => {
  let exerciseRepo: InMemoryExerciseRepository;
  let useCase: CreateExerciseUseCase;

  beforeEach(() => {
    exerciseRepo = new InMemoryExerciseRepository();
    useCase = new CreateExerciseUseCase(exerciseRepo);
  });

  it('新しいエクササイズを作成してDTOを返す', async () => {
    const result = await useCase.execute({
      name: 'Hip Thrust',
      nameJa: 'ヒップスラスト',
      muscleGroup: 'legs',
      met: 5.5,
      description: '臀筋を鍛える',
    });

    expect(result.name).toBe('Hip Thrust');
    expect(result.nameJa).toBe('ヒップスラスト');
    expect(result.muscleGroup).toBe('legs');
    expect(result.met).toBe(5.5);
    expect(result.description).toBe('臀筋を鍛える');
    expect(result.id).toBeDefined();
  });

  it('リポジトリに保存される', async () => {
    await useCase.execute({
      name: 'Pull Up',
      nameJa: 'プルアップ',
      muscleGroup: 'back',
      met: 5.5,
    });

    const exercises = exerciseRepo.getAll();
    expect(exercises).toHaveLength(1);
    expect(exercises[0].name).toBe('Pull Up');
  });

  it('MET値が不正な場合はエラー', async () => {
    await expect(
      useCase.execute({
        name: 'Bad Exercise',
        nameJa: '不正な種目',
        muscleGroup: 'chest',
        met: -1,
      })
    ).rejects.toThrow('MET value must be positive');
  });
});
