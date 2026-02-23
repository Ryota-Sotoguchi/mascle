// ========================================
// Infrastructure: SQLite Exercise Repository (Adapter)
// ========================================
import type Database from 'better-sqlite3';
import type { IExerciseRepository } from '../../domain/repositories/IExerciseRepository.js';
import { Exercise, type MuscleGroup, type InputType } from '../../domain/entities/Exercise.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';
import { METValue } from '../../domain/value-objects/METValue.js';

interface ExerciseRow {
  id: string;
  name: string;
  name_ja: string;
  muscle_group: string;
  met: number;
  description: string | null;
  input_type: string | null;
}

export class SQLiteExerciseRepository implements IExerciseRepository {
  constructor(private readonly db: Database.Database) {}

  async findById(id: UniqueId): Promise<Exercise | null> {
    const row = this.db.prepare(
      'SELECT * FROM exercises WHERE id = ?'
    ).get(id.value) as ExerciseRow | undefined;

    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Exercise[]> {
    const rows = this.db.prepare(
      'SELECT * FROM exercises ORDER BY muscle_group, name_ja'
    ).all() as ExerciseRow[];

    return rows.map(row => this.toDomain(row));
  }

  async findByMuscleGroup(group: MuscleGroup): Promise<Exercise[]> {
    const rows = this.db.prepare(
      'SELECT * FROM exercises WHERE muscle_group = ? ORDER BY name_ja'
    ).all(group) as ExerciseRow[];

    return rows.map(row => this.toDomain(row));
  }

  async save(exercise: Exercise): Promise<void> {
    this.db.prepare(`
      INSERT INTO exercises (id, name, name_ja, muscle_group, met, description, input_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      exercise.id.value,
      exercise.name,
      exercise.nameJa,
      exercise.muscleGroup,
      exercise.met.value,
      exercise.description ?? null,
      exercise.inputType,
    );
  }

  async delete(id: UniqueId): Promise<void> {
    this.db.prepare('DELETE FROM exercises WHERE id = ?').run(id.value);
  }

  private toDomain(row: ExerciseRow): Exercise {
    return Exercise.reconstruct({
      id: UniqueId.from(row.id),
      name: row.name,
      nameJa: row.name_ja,
      muscleGroup: row.muscle_group as MuscleGroup,
      met: METValue.create(row.met),
      description: row.description ?? undefined,
      inputType: (row.input_type ?? 'reps_weight') as InputType,
    });
  }
}
