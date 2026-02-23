// ========================================
// Infrastructure: SQLite User Repository (Adapter)
// ========================================
import type Database from 'better-sqlite3';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { User } from '../../domain/entities/User.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  created_at: string;
}

export class SQLiteUserRepository implements IUserRepository {
  constructor(private readonly db: Database.Database) {}

  async findById(id: UniqueId): Promise<User | null> {
    const row = this.db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).get(id.value) as UserRow | undefined;
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = this.db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).get(email.toLowerCase()) as UserRow | undefined;
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    this.db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      user.id.value,
      user.email,
      user.passwordHash,
      user.displayName,
      user.createdAt.toISOString(),
    );
  }

  private toDomain(row: UserRow): User {
    return User.reconstruct({
      id: UniqueId.from(row.id),
      email: row.email,
      passwordHash: row.password_hash,
      displayName: row.display_name,
      createdAt: new Date(row.created_at),
    });
  }
}
