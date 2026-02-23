// ========================================
// Domain Entity: User
// ========================================
import { UniqueId } from '../value-objects/UniqueId.js';

export interface UserProps {
  id: UniqueId;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
}

export class User {
  private readonly props: UserProps;

  private constructor(props: UserProps) {
    this.props = { ...props };
  }

  static create(params: {
    email: string;
    passwordHash: string;
    displayName: string;
  }): User {
    const email = params.email.trim().toLowerCase();
    if (!email.includes('@')) throw new Error('Invalid email format');
    if (!params.displayName.trim()) throw new Error('Display name is required');

    return new User({
      id: UniqueId.create(),
      email,
      passwordHash: params.passwordHash,
      displayName: params.displayName.trim(),
      createdAt: new Date(),
    });
  }

  static reconstruct(props: UserProps): User {
    return new User(props);
  }

  get id(): UniqueId { return this.props.id; }
  get email(): string { return this.props.email; }
  get passwordHash(): string { return this.props.passwordHash; }
  get displayName(): string { return this.props.displayName; }
  get createdAt(): Date { return this.props.createdAt; }
}
