// ========================================
// Integration Test: SQLiteWorkoutSessionRepository
// ========================================
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { SQLiteWorkoutSessionRepository } from './SQLiteWorkoutSessionRepository.js';
import { WorkoutSession } from '../../domain/entities/WorkoutSession.js';
import { WorkoutSet } from '../../domain/entities/WorkoutSet.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';

function createSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_ja TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      met REAL NOT NULL,
      description TEXT
    );

    CREATE TABLE workout_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      body_weight_kg REAL NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE workout_sets (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      weight_kg REAL NOT NULL,
      duration_minutes REAL NOT NULL,
      calories_burned REAL NOT NULL,
      speed_kmh REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );

    CREATE INDEX idx_workout_sessions_date ON workout_sessions(date);
    CREATE INDEX idx_workout_sets_session_id ON workout_sets(session_id);
  `);
}

function seedExercise(db: Database.Database, id: string = 'ex-bench-press'): void {
  db.prepare(`
    INSERT INTO exercises (id, name, name_ja, muscle_group, met, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, 'Bench Press', 'ベンチプレス', 'chest', 6.0, null);
}

describe('SQLiteWorkoutSessionRepository', () => {
  let db: Database.Database;
  let repo: SQLiteWorkoutSessionRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    createSchema(db);
    seedExercise(db, 'ex-bench-press');
    seedExercise(db, 'ex-squat');
    repo = new SQLiteWorkoutSessionRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  function createSession(overrides?: {
    id?: string;
    date?: Date;
    bodyWeightKg?: number;
    note?: string;
    userId?: string;
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

  function createSet(overrides?: {
    id?: string;
    exerciseId?: string;
    setNumber?: number;
    reps?: number;
    weightKg?: number;
  }): WorkoutSet {
    return WorkoutSet.reconstruct({
      id: UniqueId.from(overrides?.id ?? 'set-001'),
      exerciseId: UniqueId.from(overrides?.exerciseId ?? 'ex-bench-press'),
      setNumber: overrides?.setNumber ?? 1,
      reps: overrides?.reps ?? 10,
      weightKg: overrides?.weightKg ?? 60,
      durationMinutes: 1.5,
      caloriesBurned: 15.0,
    });
  }

  describe('save', () => {
    it('セッションを保存する', async () => {
      const session = createSession({ note: '胸の日' });
      await repo.save(session);

      const row = db.prepare('SELECT * FROM workout_sessions WHERE id = ?').get('session-001') as any;
      expect(row).toBeDefined();
      expect(row.body_weight_kg).toBe(70);
      expect(row.note).toBe('胸の日');
    });

    it('セッションとセットを一緒に保存する', async () => {
      const session = createSession();
      session.addSet(createSet({ id: 'set-1', setNumber: 1 }));
      session.addSet(createSet({ id: 'set-2', setNumber: 2, reps: 8, weightKg: 65 }));

      await repo.save(session);

      const setRows = db.prepare('SELECT * FROM workout_sets WHERE session_id = ?').all('session-001');
      expect(setRows).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('IDでセッションを取得する（セット含む）', async () => {
      const session = createSession();
      session.addSet(createSet({ id: 'set-1', setNumber: 1 }));
      await repo.save(session);

      const found = await repo.findById(UniqueId.from('session-001'));

      expect(found).not.toBeNull();
      expect(found!.id.value).toBe('session-001');
      expect(found!.bodyWeightKg).toBe(70);
      expect(found!.sets).toHaveLength(1);
      expect(found!.sets[0].reps).toBe(10);
    });

    it('存在しないIDはnullを返す', async () => {
      const found = await repo.findById(UniqueId.from('non-existent'));
      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('ユーザーのセッションを日付降順で返す', async () => {
      await repo.save(createSession({ id: 'session-1', date: new Date('2026-02-10') }));
      await repo.save(createSession({ id: 'session-2', date: new Date('2026-02-13') }));

      const all = await repo.findByUserId(UniqueId.from('user-001'));

      expect(all).toHaveLength(2);
      // 降順なのでsession-2が先
      expect(all[0].id.value).toBe('session-2');
      expect(all[1].id.value).toBe('session-1');
    });

    it('各セッションにセットが含まれる', async () => {
      const session = createSession();
      session.addSet(createSet({ id: 'set-1', setNumber: 1 }));
      session.addSet(createSet({ id: 'set-2', setNumber: 2 }));
      await repo.save(session);

      const all = await repo.findByUserId(UniqueId.from('user-001'));
      expect(all[0].sets).toHaveLength(2);
    });

    it('空の場合は空配列を返す', async () => {
      const all = await repo.findByUserId(UniqueId.from('user-001'));
      expect(all).toEqual([]);
    });

    it('他ユーザーのセッションは返さない', async () => {
      await repo.save(createSession({ id: 'session-1', userId: 'user-001' }));
      await repo.save(createSession({ id: 'session-2', userId: 'user-002' }));

      const all = await repo.findByUserId(UniqueId.from('user-001'));
      expect(all).toHaveLength(1);
      expect(all[0].id.value).toBe('session-1');
    });
  });

  describe('findByUserIdAndDateRange', () => {
    it('日付範囲でセッションをフィルタリングする', async () => {
      await repo.save(createSession({ id: 's1', date: new Date('2026-02-01') }));
      await repo.save(createSession({ id: 's2', date: new Date('2026-02-10') }));
      await repo.save(createSession({ id: 's3', date: new Date('2026-02-20') }));

      const result = await repo.findByUserIdAndDateRange(
        UniqueId.from('user-001'),
        new Date('2026-02-05'),
        new Date('2026-02-15')
      );

      expect(result).toHaveLength(1);
      expect(result[0].id.value).toBe('s2');
    });

    it('境界の日付が含まれる', async () => {
      await repo.save(createSession({ id: 's1', date: new Date('2026-02-01') }));
      await repo.save(createSession({ id: 's2', date: new Date('2026-02-28') }));

      const result = await repo.findByUserIdAndDateRange(
        UniqueId.from('user-001'),
        new Date('2026-02-01'),
        new Date('2026-02-28')
      );

      expect(result).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('セッションの基本情報を更新する', async () => {
      const session = createSession({ note: '元のメモ' });
      await repo.save(session);

      session.updateNote('更新後のメモ');
      await repo.update(session);

      const updated = await repo.findById(UniqueId.from('session-001'));
      expect(updated!.note).toBe('更新後のメモ');
    });

    it('セットを追加して更新する', async () => {
      const session = createSession();
      session.addSet(createSet({ id: 'set-1', setNumber: 1 }));
      await repo.save(session);

      // 新しいセットを追加して更新
      session.addSet(createSet({ id: 'set-2', setNumber: 2, reps: 8 }));
      await repo.update(session);

      const updated = await repo.findById(UniqueId.from('session-001'));
      expect(updated!.sets).toHaveLength(2);
      expect(updated!.sets[1].reps).toBe(8);
    });

    it('update後に古いセットが残らない（削除→再挿入戦略）', async () => {
      const session = createSession();
      session.addSet(createSet({ id: 'set-1', setNumber: 1 }));
      session.addSet(createSet({ id: 'set-2', setNumber: 2 }));
      await repo.save(session);

      // 1つ目のセットを削除して更新
      session.removeSet(UniqueId.from('set-1'));
      await repo.update(session);

      const updated = await repo.findById(UniqueId.from('session-001'));
      expect(updated!.sets).toHaveLength(1);

      // DBにも1件しかない
      const dbSets = db.prepare('SELECT * FROM workout_sets WHERE session_id = ?').all('session-001');
      expect(dbSets).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('セッションを削除する', async () => {
      await repo.save(createSession({ id: 'session-1' }));

      await repo.delete(UniqueId.from('session-1'));

      const found = await repo.findById(UniqueId.from('session-1'));
      expect(found).toBeNull();
    });

    it('カスケード削除でセットも削除される', async () => {
      const session = createSession({ id: 'session-1' });
      session.addSet(createSet({ id: 'set-1' }));
      await repo.save(session);

      await repo.delete(UniqueId.from('session-1'));

      const setRows = db.prepare('SELECT * FROM workout_sets WHERE session_id = ?').all('session-1');
      expect(setRows).toHaveLength(0);
    });

    it('存在しないIDでもエラーにならない', async () => {
      await expect(repo.delete(UniqueId.from('non-existent'))).resolves.not.toThrow();
    });
  });

  describe('ドメインオブジェクトの復元', () => {
    it('保存→取得でセッションが正しく復元される', async () => {
      const original = createSession({
        id: 'session-test',
        date: new Date('2026-01-15'),
        bodyWeightKg: 68.5,
        note: 'テストセッション',
      });
      original.addSet(createSet({ id: 'set-1', exerciseId: 'ex-bench-press', setNumber: 1, reps: 12, weightKg: 50 }));

      await repo.save(original);
      const restored = await repo.findById(UniqueId.from('session-test'));

      expect(restored!.id.value).toBe('session-test');
      expect(restored!.bodyWeightKg).toBe(68.5);
      expect(restored!.note).toBe('テストセッション');
      expect(restored!.sets).toHaveLength(1);
      expect(restored!.sets[0].reps).toBe(12);
      expect(restored!.sets[0].weightKg).toBe(50);
      expect(restored!.sets[0].exerciseId.value).toBe('ex-bench-press');
    });

    it('集計プロパティが復元後も正しく動作する', async () => {
      const session = createSession({ bodyWeightKg: 70 });
      session.addSet(createSet({ id: 'set-1', setNumber: 1, reps: 10, weightKg: 60 }));
      session.addSet(createSet({ id: 'set-2', setNumber: 2, reps: 8, weightKg: 65 }));

      await repo.save(session);
      const restored = await repo.findById(UniqueId.from('session-001'));

      expect(restored!.totalSets).toBe(2);
      expect(restored!.totalVolume).toBe(10 * 60 + 8 * 65); // 1120
      expect(restored!.totalCaloriesBurned).toBe(30.0); // 15.0 + 15.0
    });
  });
});
