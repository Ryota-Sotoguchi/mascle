// ========================================
// Use Case: RegisterUser
// ========================================
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { User } from '../../domain/entities/User.js';
import type { RegisterDTO, AuthResponseDTO } from '../dtos/AuthDTO.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET ?? 'mascle-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export class RegisterUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: RegisterDTO): Promise<AuthResponseDTO> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new Error('このメールアドレスは既に登録されています');

    if (dto.password.length < 8) throw new Error('パスワードは8文字以上で設定してください');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = User.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
    });

    await this.userRepo.save(user);

    const token = jwt.sign(
      { userId: user.id.value, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    return {
      token,
      user: {
        id: user.id.value,
        email: user.email,
        displayName: user.displayName,
      },
    };
  }
}
