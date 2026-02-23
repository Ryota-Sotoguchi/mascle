// ========================================
// Infrastructure: Database Connection
// ========================================
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = path.join(__dirname, '..', '..', '..', 'data', 'mascle.db');
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : DEFAULT_DB_PATH;

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_ja TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      met REAL NOT NULL,
      description TEXT,
      input_type TEXT NOT NULL DEFAULT 'reps_weight'
    );

    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      date TEXT NOT NULL,
      body_weight_kg REAL NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workout_sets (
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

    CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(date);
    CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_workout_sets_session_id ON workout_sets(session_id);
  `);

  // マイグレーション: user_id カラムが存在しない場合は追加
  runMigrations(db);
}

function runMigrations(db: Database.Database): void {
  // workout_sessions に user_id カラムが存在するか確認
  const cols = db.pragma('table_info(workout_sessions)') as Array<{ name: string }>;
  const hasUserId = cols.some(c => c.name === 'user_id');
  if (!hasUserId) {
    db.exec(`ALTER TABLE workout_sessions ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE`);
    console.log('🔄 Migration: added user_id column to workout_sessions');
  }

  // exercises に input_type カラムが存在するか確認
  const exCols = db.pragma('table_info(exercises)') as Array<{ name: string }>;
  const hasInputType = exCols.some(c => c.name === 'input_type');
  if (!hasInputType) {
    db.exec(`ALTER TABLE exercises ADD COLUMN input_type TEXT NOT NULL DEFAULT 'reps_weight'`);
    console.log('🔄 Migration: added input_type column to exercises');
  }

  // workout_sets に speed_kmh カラムが存在するか確認
  const setCols = db.pragma('table_info(workout_sets)') as Array<{ name: string }>;
  const hasSpeedKmh = setCols.some(c => c.name === 'speed_kmh');
  if (!hasSpeedKmh) {
    db.exec(`ALTER TABLE workout_sets ADD COLUMN speed_kmh REAL NOT NULL DEFAULT 0`);
    console.log('🔄 Migration: added speed_kmh column to workout_sets');
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
