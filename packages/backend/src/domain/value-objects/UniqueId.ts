// ========================================
// Value Object: UniqueId
// ========================================
import { v4 as uuidv4 } from 'uuid';

export class UniqueId {
  private constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('ID cannot be empty');
    }
  }

  static create(): UniqueId {
    return new UniqueId(uuidv4());
  }

  static from(value: string): UniqueId {
    return new UniqueId(value);
  }

  equals(other: UniqueId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
