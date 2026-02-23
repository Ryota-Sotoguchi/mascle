// ========================================
// Infrastructure: SQLite WorkoutSession Repository (Adapter)
// ========================================
import type Database from 'better-sqlite3';
import type { IWorkoutSessionRepository } from '../../domain/repositories/IWorkoutSessionRepository.js';
import { WorkoutSession } from '../../domain/entities/WorkoutSession.js';
import { WorkoutSet } from '../../domain/entities/WorkoutSet.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';

interface SessionRow {
  id: string;
  user_id: string;
  date: string;
  body_weight_kg: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

interface SetRow {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  duration_minutes: number;
  calories_burned: number;
  speed_kmh: number;
}

export class SQLiteWorkoutSessionRepository implements IWorkoutSessionRepository {
  constructor(private readonly db: Database.Database) {}

  async findById(id: UniqueId): Promise<WorkoutSession | null> {
    const row = this.db.prepare(
      'SELECT * FROM workout_sessions WHERE id = ?'
    ).get(id.value) as SessionRow | undefined;

    if (!row) return null;

    const setRows = this.db.prepare(
      'SELECT * FROM workout_sets WHERE session_id = ? ORDER BY set_number'
    ).all(id.value) as SetRow[];

    return this.toDomain(row, setRows);
  }

  async findByUserId(userId: UniqueId): Promise<WorkoutSession[]> {
    const rows = this.db.prepare(
      'SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY date DESC'
    ).all(userId.value) as SessionRow[];

    return rows.map(row => {
      const setRows = this.db.prepare(
        'SELECT * FROM workout_sets WHERE session_id = ? ORDER BY set_number'
      ).all(row.id) as SetRow[];
      return this.toDomain(row, setRows);
    });
  }

  async findByUserIdAndDateRange(userId: UniqueId, from: Date, to: Date): Promise<WorkoutSession[]> {
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];

    const rows = this.db.prepare(
      'SELECT * FROM workout_sessions WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date DESC'
    ).all(userId.value, fromStr, toStr) as SessionRow[];

    return rows.map(row => {
      const setRows = this.db.prepare(
        'SELECT * FROM workout_sets WHERE session_id = ? ORDER BY set_number'
      ).all(row.id) as SetRow[];
      return this.toDomain(row, setRows);
    });
  }

  async save(session: WorkoutSession): Promise<void> {
    const insertSession = this.db.prepare(`
      INSERT INTO workout_sessions (id, user_id, date, body_weight_kg, note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertSet = this.db.prepare(`
      INSERT INTO workout_sets (id, session_id, exercise_id, set_number, reps, weight_kg, duration_minutes, calories_burned, speed_kmh)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const saveAll = this.db.transaction(() => {
      insertSession.run(
        session.id.value,
        session.userId.value,
        session.date.toISOString().split('T')[0],
        session.bodyWeightKg,
        session.note ?? null,
        session.createdAt.toISOString(),
        session.updatedAt.toISOString(),
      );

      for (const set of session.sets) {
        insertSet.run(
          set.id.value,
          session.id.value,
          set.exerciseId.value,
          set.setNumber,
          set.reps,
          set.weightKg,
          set.durationMinutes,
          set.caloriesBurned,
          set.speedKmh,
        );
      }
    });

    saveAll();
  }

  async update(session: WorkoutSession): Promise<void> {
    const updateSession = this.db.prepare(`
      UPDATE workout_sessions
      SET date = ?, body_weight_kg = ?, note = ?, updated_at = ?
      WHERE id = ?
    `);

    const deleteOldSets = this.db.prepare(
      'DELETE FROM workout_sets WHERE session_id = ?'
    );

    const insertSet = this.db.prepare(`
      INSERT INTO workout_sets (id, session_id, exercise_id, set_number, reps, weight_kg, duration_minutes, calories_burned, speed_kmh)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateAll = this.db.transaction(() => {
      updateSession.run(
        session.date.toISOString().split('T')[0],
        session.bodyWeightKg,
        session.note ?? null,
        session.updatedAt.toISOString(),
        session.id.value,
      );

      deleteOldSets.run(session.id.value);

      for (const set of session.sets) {
        insertSet.run(
          set.id.value,
          session.id.value,
          set.exerciseId.value,
          set.setNumber,
          set.reps,
          set.weightKg,
          set.durationMinutes,
          set.caloriesBurned,
          set.speedKmh,
        );
      }
    });

    updateAll();
  }

  async delete(id: UniqueId): Promise<void> {
    this.db.prepare('DELETE FROM workout_sessions WHERE id = ?').run(id.value);
  }

  private toDomain(row: SessionRow, setRows: SetRow[]): WorkoutSession {
    const sets = setRows.map(sr =>
      WorkoutSet.reconstruct({
        id: UniqueId.from(sr.id),
        exerciseId: UniqueId.from(sr.exercise_id),
        setNumber: sr.set_number,
        reps: sr.reps,
        weightKg: sr.weight_kg,
        durationMinutes: sr.duration_minutes,
        caloriesBurned: sr.calories_burned,
        speedKmh: sr.speed_kmh ?? 0,
      })
    );

    return WorkoutSession.reconstruct({
      id: UniqueId.from(row.id),
      userId: UniqueId.from(row.user_id),
      date: new Date(row.date),
      bodyWeightKg: row.body_weight_kg,
      note: row.note ?? undefined,
      sets,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
