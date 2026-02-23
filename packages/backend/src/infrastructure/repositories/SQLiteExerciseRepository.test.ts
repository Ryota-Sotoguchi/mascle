// ========================================
// Integration Test: SQLiteExerciseRepository
// ========================================
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { SQLiteExerciseRepository } from './SQLiteExerciseRepository.js';
import { Exercise } from '../../domain/entities/Exercise.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';
import { METValue } from '../../domain/value-objects/METValue.js';

function createSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_ja TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      met REAL NOT NULL,
      description TEXT,
      input_type TEXT NOT NULL DEFAULT 'reps_weight'
    );
  `);
}

describe('SQLiteExerciseRepository', () => {
  let db: Database.Database;
  let repo: SQLiteExerciseRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    createSchema(db);
    repo = new SQLiteExerciseRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  function createExercise(overrides?: {
    id?: string;
    name?: string;
    nameJa?: string;
    muscleGroup?: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'full_body' | 'cardio';
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

  describe('save', () => {
    it('エクササイズを保存する', async () => {
      const exercise = createExercise();
      await repo.save(exercise);

      const row = db.prepare('SELECT * FROM exercises WHERE id = ?').get('ex-bench-press') as any;
      expect(row).toBeDefined();
      expect(row.name).toBe('Bench Press');
      expect(row.name_ja).toBe('ベンチプレス');
      expect(row.muscle_group).toBe('chest');
      expect(row.met).toBe(6.0);
    });

    it('descriptionなしで保存できる', async () => {
      const exercise = createExercise({ description: undefined });
      await repo.save(exercise);

      const row = db.prepare('SELECT * FROM exercises WHERE id = ?').get('ex-bench-press') as any;
      expect(row.description).toBeNull();
    });
  });

  describe('findById', () => {
    it('IDでエクササイズを取得する', async () => {
      await repo.save(createExercise({ id: 'ex-1', name: 'Squat', nameJa: 'スクワット' }));

      const found = await repo.findById(UniqueId.from('ex-1'));

      expect(found).not.toBeNull();
      expect(found!.id.value).toBe('ex-1');
      expect(found!.name).toBe('Squat');
      expect(found!.nameJa).toBe('スクワット');
    });

    it('存在しないIDはnullを返す', async () => {
      const found = await repo.findById(UniqueId.from('non-existent'));
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('全エクササイズを取得する', async () => {
      await repo.save(createExercise({ id: 'ex-1', nameJa: 'ベンチプレス', muscleGroup: 'chest' }));
      await repo.save(createExercise({ id: 'ex-2', nameJa: 'スクワット', muscleGroup: 'legs' }));

      const all = await repo.findAll();
      expect(all).toHaveLength(2);
    });

    it('空の場合は空配列を返す', async () => {
      const all = await repo.findAll();
      expect(all).toEqual([]);
    });
  });

  describe('findByMuscleGroup', () => {
    it('筋肉グループでフィルタリングする', async () => {
      await repo.save(createExercise({ id: 'ex-1', muscleGroup: 'chest' }));
      await repo.save(createExercise({ id: 'ex-2', muscleGroup: 'legs' }));
      await repo.save(createExercise({ id: 'ex-3', muscleGroup: 'chest' }));

      const chestExercises = await repo.findByMuscleGroup('chest');
      expect(chestExercises).toHaveLength(2);
      expect(chestExercises.every(e => e.muscleGroup === 'chest')).toBe(true);
    });

    it('該当なしの場合は空配列', async () => {
      await repo.save(createExercise({ id: 'ex-1', muscleGroup: 'chest' }));

      const result = await repo.findByMuscleGroup('core');
      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('エクササイズを削除する', async () => {
      await repo.save(createExercise({ id: 'ex-1' }));

      await repo.delete(UniqueId.from('ex-1'));

      const found = await repo.findById(UniqueId.from('ex-1'));
      expect(found).toBeNull();
    });

    it('存在しないIDでもエラーにならない', async () => {
      await expect(repo.delete(UniqueId.from('non-existent'))).resolves.not.toThrow();
    });
  });

  describe('ドメインオブジェクトへの変換', () => {
    it('保存→取得でドメインオブジェクトが正しく復元される', async () => {
      const original = createExercise({
        id: 'ex-deadlift',
        name: 'Deadlift',
        nameJa: 'デッドリフト',
        muscleGroup: 'back',
        met: 6.0,
        description: '後面全体を鍛える',
      });

      await repo.save(original);
      const restored = await repo.findById(UniqueId.from('ex-deadlift'));

      expect(restored!.id.value).toBe(original.id.value);
      expect(restored!.name).toBe(original.name);
      expect(restored!.nameJa).toBe(original.nameJa);
      expect(restored!.muscleGroup).toBe(original.muscleGroup);
      expect(restored!.met.value).toBe(original.met.value);
      expect(restored!.description).toBe(original.description);
    });
  });
});
