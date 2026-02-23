// ========================================
// Repository Interface (Port): IUserRepository
// ========================================
import { User } from '../entities/User.js';
import { UniqueId } from '../value-objects/UniqueId.js';

export interface IUserRepository {
  findById(id: UniqueId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
