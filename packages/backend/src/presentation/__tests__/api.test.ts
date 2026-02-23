// ========================================
// Integration Test: Express API Routes (supertest)
// ========================================
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import Database from 'better-sqlite3';
import request from 'supertest';
import { createRoutes } from '../routes/index.js';
import { SQLiteExerciseRepository } from '../../infrastructure/repositories/SQLiteExerciseRepository.js';
import { SQLiteWorkoutSessionRepository } from '../../infrastructure/repositories/SQLiteWorkoutSessionRepository.js';
import { SQLiteUserRepository } from '../../infrastructure/repositories/SQLiteUserRepository.js';
import { GetExercisesUseCase } from '../../application/use-cases/GetExercisesUseCase.js';
import { CreateExerciseUseCase } from '../../application/use-cases/CreateExerciseUseCase.js';
import { CreateWorkoutSessionUseCase } from '../../application/use-cases/CreateWorkoutSessionUseCase.js';
import { AddWorkoutSetUseCase } from '../../application/use-cases/AddWorkoutSetUseCase.js';
import { RemoveWorkoutSetUseCase } from '../../application/use-cases/RemoveWorkoutSetUseCase.js';
import { GetWorkoutSessionsUseCase } from '../../application/use-cases/GetWorkoutSessionsUseCase.js';
import { GetWorkoutSessionByIdUseCase } from '../../application/use-cases/GetWorkoutSessionByIdUseCase.js';
import { DeleteWorkoutSessionUseCase } from '../../application/use-cases/DeleteWorkoutSessionUseCase.js';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase.js';
import { LoginUserUseCase } from '../../application/use-cases/LoginUserUseCase.js';
import type { Container } from '../../infrastructure/di/container.js';

function createTestApp(): { app: express.Express; db: Database.Database } {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_ja TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      met REAL NOT NULL,
      description TEXT,
      input_type TEXT NOT NULL DEFAULT 'reps_weight'
    );

    CREATE TABLE workout_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      body_weight_kg REAL NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
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
  `);

  // シードデータ
  db.prepare(`
    INSERT INTO exercises (id, name, name_ja, muscle_group, met, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('ex-bench-press', 'Bench Press', 'ベンチプレス', 'chest', 6.0, '大胸筋を鍛える');

  db.prepare(`
    INSERT INTO exercises (id, name, name_ja, muscle_group, met, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('ex-squat', 'Barbell Squat', 'バーベルスクワット', 'legs', 6.0, '下半身全体');

  const exerciseRepo = new SQLiteExerciseRepository(db);
  const sessionRepo = new SQLiteWorkoutSessionRepository(db);
  const userRepo = new SQLiteUserRepository(db);

  const container: Container = {
    registerUser: new RegisterUserUseCase(userRepo),
    loginUser: new LoginUserUseCase(userRepo),
    getExercises: new GetExercisesUseCase(exerciseRepo),
    createExercise: new CreateExerciseUseCase(exerciseRepo),
    createWorkoutSession: new CreateWorkoutSessionUseCase(sessionRepo),
    addWorkoutSet: new AddWorkoutSetUseCase(sessionRepo, exerciseRepo),
    removeWorkoutSet: new RemoveWorkoutSetUseCase(sessionRepo, exerciseRepo),
    getWorkoutSessions: new GetWorkoutSessionsUseCase(sessionRepo, exerciseRepo),
    getWorkoutSessionById: new GetWorkoutSessionByIdUseCase(sessionRepo, exerciseRepo),
    deleteWorkoutSession: new DeleteWorkoutSessionUseCase(sessionRepo),
  };

  const app = express();
  app.use(express.json());
  app.use('/api', createRoutes(container));

  return { app, db };
}

/** テスト用ユーザーを登録してJWTトークンを取得する */
async function getAuthToken(app: express.Express): Promise<string> {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com', password: 'password123', displayName: 'Test User' });
  return res.body.data.token as string;
}

// ========================================
// Auth API
// ========================================
describe('Auth API', () => {
  let app: express.Express;
  let db: Database.Database;

  beforeEach(() => {
    ({ app, db } = createTestApp());
  });

  afterEach(() => {
    db.close();
  });

  describe('POST /api/auth/register', () => {
    it('新しいユーザーを登録してトークンを返す', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'user@example.com', password: 'password123', displayName: 'Alice' });

      expect(res.status).toBe(201);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('user@example.com');
      expect(res.body.data.user.displayName).toBe('Alice');
    });

    it('重複メールはエラー', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'user@example.com', password: 'password123', displayName: 'Alice' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'user@example.com', password: 'password456', displayName: 'Bob' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('短すぎるパスワードはエラー', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'user@example.com', password: 'short', displayName: 'Alice' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('正しい認証情報でログインできる', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'user@example.com', password: 'password123', displayName: 'Alice' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('user@example.com');
    });

    it('誤ったパスワードはエラー', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'user@example.com', password: 'password123', displayName: 'Alice' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
    });

    it('存在しないユーザーはエラー', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('有効なトークンでユーザー情報を返す', async () => {
      const token = await getAuthToken(app);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('トークンなしは401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});

// ========================================
// Exercise API
// ========================================
describe('Exercise API', () => {
  let app: express.Express;
  let db: Database.Database;

  beforeEach(() => {
    ({ app, db } = createTestApp());
  });

  afterEach(() => {
    db.close();
  });

  describe('GET /api/exercises', () => {
    it('全エクササイズを取得する', async () => {
      const res = await request(app).get('/api/exercises');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toHaveProperty('id');
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('nameJa');
      expect(res.body.data[0]).toHaveProperty('muscleGroup');
      expect(res.body.data[0]).toHaveProperty('met');
    });

    it('筋肉グループでフィルタリングする', async () => {
      const res = await request(app).get('/api/exercises?muscleGroup=chest');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].muscleGroup).toBe('chest');
    });

    it('該当なしの場合は空配列を返す', async () => {
      const res = await request(app).get('/api/exercises?muscleGroup=core');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('POST /api/exercises', () => {
    it('新しいエクササイズを作成する', async () => {
      const res = await request(app)
        .post('/api/exercises')
        .send({
          name: 'Deadlift',
          nameJa: 'デッドリフト',
          muscleGroup: 'back',
          met: 6.0,
          description: '後面全体',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Deadlift');
      expect(res.body.data.nameJa).toBe('デッドリフト');
      expect(res.body.data.id).toBeDefined();
    });

    it('不正なMET値はエラーを返す', async () => {
      const res = await request(app)
        .post('/api/exercises')
        .send({
          name: 'Bad',
          nameJa: '不正',
          muscleGroup: 'chest',
          met: -1,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });
});

// ========================================
// Workout Session API
// ========================================
describe('WorkoutSession API', () => {
  let app: express.Express;
  let db: Database.Database;
  let token: string;

  beforeEach(async () => {
    ({ app, db } = createTestApp());
    token = await getAuthToken(app);
  });

  afterEach(() => {
    db.close();
  });

  describe('POST /api/sessions', () => {
    it('新しいセッションを作成する', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2026-02-13',
          bodyWeightKg: 70,
          note: '胸の日',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.date).toBe('2026-02-13');
      expect(res.body.data.bodyWeightKg).toBe(70);
      expect(res.body.data.note).toBe('胸の日');
      expect(res.body.data.sets).toEqual([]);
      expect(res.body.data.totalSets).toBe(0);
    });

    it('体重0はエラー', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2026-02-13',
          bodyWeightKg: 0,
        });

      expect(res.status).toBe(400);
    });

    it('トークンなしは401', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({ date: '2026-02-13', bodyWeightKg: 70 });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/sessions', () => {
    it('自分のセッションを取得する', async () => {
      // まずセッションを作る
      await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2026-02-10', bodyWeightKg: 70 });
      await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2026-02-13', bodyWeightKg: 72 });

      const res = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('セッションがない場合は空配列', async () => {
      const res = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/sessions/:id', () => {
    it('IDでセッションを取得する', async () => {
      const createRes = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2026-02-13', bodyWeightKg: 70 });

      const sessionId = createRes.body.data.id;
      const res = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(sessionId);
      expect(res.body.data.bodyWeightKg).toBe(70);
    });

    it('存在しないIDは404を返す', async () => {
      const res = await request(app)
        .get('/api/sessions/non-existent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Session not found');
    });
  });

  describe('POST /api/sessions/:id/sets', () => {
    it('セッションにセットを追加する', async () => {
      const createRes = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2026-02-13', bodyWeightKg: 70 });
      const sessionId = createRes.body.data.id;

      const res = await request(app)
        .post(`/api/sessions/${sessionId}/sets`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          exerciseId: 'ex-bench-press',
          reps: 10,
          weightKg: 60,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.sets).toHaveLength(1);
      expect(res.body.data.sets[0].exerciseId).toBe('ex-bench-press');
      expect(res.body.data.sets[0].reps).toBe(10);
      expect(res.body.data.sets[0].weightKg).toBe(60);
      expect(res.body.data.sets[0].caloriesBurned).toBeGreaterThan(0);
      expect(res.body.data.totalCaloriesBurned).toBeGreaterThan(0);
    });

    it('エクササイズ名がレスポンスに含まれる', async () => {
      const createRes = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2026-02-13', bodyWeightKg: 70 });
      const sessionId = createRes.body.data.id;

      const res = await request(app)
        .post(`/api/sessions/${sessionId}/sets`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          exerciseId: 'ex-bench-press',
          reps: 10,
          weightKg: 60,
        });

      expect(res.body.data.sets[0].exerciseName).toBe('Bench Press');
      expect(res.body.data.sets[0].exerciseNameJa).toBe('ベンチプレス');
    });

    it('複数セットを追加してセット番号が自動採番される', async () => {
      const createRes = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2026-02-13', bodyWeightKg: 70 });
      const sessionId = createRes.body.data.id;

      await request(app)
        .post(`/api/sessions/${sessionId}/sets`)
        .set('Authorization', `Bearer ${token}`)
        .send({ exerciseId: 'ex-bench-press', reps: 10, weightKg: 60 });

      const res = await request(app)
        .post(`/api/sessions/${sessionId}/sets`)
        .set('Authorization', `Bearer ${token}`)
        .send({ exerciseId: 'ex-squat', reps: 5, weightKg: 100 });

      expect(res.body.data.sets).toHaveLength(2);
      expect(res.body.data.sets[0].setNumber).toBe(1);
      expect(res.body.data.sets[1].setNumber).toBe(2);
    });

    it('存在しないセッションにセット追加はエラー', async () => {
      const res = await request(app)
        .post('/api/sessions/non-existent/sets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          exerciseId: 'ex-bench-press',
          reps: 10,
          weightKg: 60,
        });

      expect(res.status).toBe(400);
    });

    it('存在しないエクササイズIDはエラー', async () => {
      const createRes = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2026-02-13', bodyWeightKg: 70 });
      const sessionId = createRes.body.data.id;

      const res = await request(app)
        .post(`/api/sessions/${sessionId}/sets`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          exerciseId: 'non-existent',
          reps: 10,
          weightKg: 60,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    it('セッションを削除する', async () => {
      const createRes = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2026-02-13', bodyWeightKg: 70 });
      const sessionId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(deleteRes.status).toBe(204);

      // 削除確認
      const getRes = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(getRes.status).toBe(404);
    });

    it('存在しないIDでもエラーにならない（204）', async () => {
      const res = await request(app)
        .delete('/api/sessions/non-existent')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
    });
  });

  describe('E2E: セッション作成→セット追加→確認→削除', () => {
    it('一連のワークフロー全体が動作する', async () => {
      // 1. セッション作成
      const createRes = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2026-02-13', bodyWeightKg: 70, note: 'テスト' });
      expect(createRes.status).toBe(201);
      const sessionId = createRes.body.data.id;

      // 2. セットを3つ追加
      await request(app)
        .post(`/api/sessions/${sessionId}/sets`)
        .set('Authorization', `Bearer ${token}`)
        .send({ exerciseId: 'ex-bench-press', reps: 10, weightKg: 60 });

      await request(app)
        .post(`/api/sessions/${sessionId}/sets`)
        .set('Authorization', `Bearer ${token}`)
        .send({ exerciseId: 'ex-bench-press', reps: 8, weightKg: 65 });

      const addSetRes = await request(app)
        .post(`/api/sessions/${sessionId}/sets`)
        .set('Authorization', `Bearer ${token}`)
        .send({ exerciseId: 'ex-squat', reps: 5, weightKg: 100 });

      // 3. 最終状態を確認
      expect(addSetRes.body.data.sets).toHaveLength(3);
      expect(addSetRes.body.data.totalSets).toBe(3);
      expect(addSetRes.body.data.totalCaloriesBurned).toBeGreaterThan(0);
      expect(addSetRes.body.data.totalVolume).toBe(10 * 60 + 8 * 65 + 5 * 100); // 1620

      // 4. 個別取得で確認
      const getRes = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.sets).toHaveLength(3);

      // 5. 一覧に含まれることを確認
      const listRes = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${token}`);
      expect(listRes.body.data).toHaveLength(1);

      // 6. 削除
      const deleteRes = await request(app)
        .delete(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(deleteRes.status).toBe(204);

      // 7. 削除確認
      const checkRes = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
