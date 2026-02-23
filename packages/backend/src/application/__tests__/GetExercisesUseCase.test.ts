// ========================================
// Unit Test: GetExercisesUseCase
// ========================================
import { describe, it, expect, beforeEach } from 'vitest';
import { GetExercisesUseCase } from '../use-cases/GetExercisesUseCase.js';
import { InMemoryExerciseRepository, createTestExercise } from './helpers.js';

describe('GetExercisesUseCase', () => {
  let exerciseRepo: InMemoryExerciseRepository;
  let useCase: GetExercisesUseCase;

  beforeEach(() => {
    exerciseRepo = new InMemoryExerciseRepository();
    useCase = new GetExercisesUseCase(exerciseRepo);
  });

  it('全エクササイズを取得する', async () => {
    exerciseRepo.seed([
      createTestExercise({ id: 'ex-1', name: 'Bench Press', nameJa: 'ベンチプレス', muscleGroup: 'chest' }),
      createTestExercise({ id: 'ex-2', name: 'Squat', nameJa: 'スクワット', muscleGroup: 'legs' }),
    ]);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('ex-1');
    expect(result[1].id).toBe('ex-2');
  });

  it('筋肉グループでフィルタリングする', async () => {
    exerciseRepo.seed([
      createTestExercise({ id: 'ex-1', muscleGroup: 'chest' }),
      createTestExercise({ id: 'ex-2', muscleGroup: 'legs' }),
      createTestExercise({ id: 'ex-3', muscleGroup: 'chest' }),
    ]);

    const result = await useCase.execute('chest');

    expect(result).toHaveLength(2);
    expect(result.every(e => e.muscleGroup === 'chest')).toBe(true);
  });

  it('エクササイズがない場合は空配列を返す', async () => {
    const result = await useCase.execute();
    expect(result).toEqual([]);
  });

  it('DTOフォーマットで返す', async () => {
    exerciseRepo.seed([
      createTestExercise({
        id: 'ex-1',
        name: 'Deadlift',
        nameJa: 'デッドリフト',
        muscleGroup: 'back',
        met: 6.0,
      }),
    ]);

    const [dto] = await useCase.execute();

    expect(dto).toEqual({
      id: 'ex-1',
      name: 'Deadlift',
      nameJa: 'デッドリフト',
      muscleGroup: 'back',
      met: 6.0,
      description: undefined,
      inputType: 'reps_weight',
    });
  });
});
