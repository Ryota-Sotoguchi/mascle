// ========================================
// Use Case: LoginUser
// ========================================
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { LoginDTO, AuthResponseDTO } from '../dtos/AuthDTO.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'mascle-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export class LoginUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new Error('メールアドレスまたはパスワードが正しくありません');

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) throw new Error('メールアドレスまたはパスワードが正しくありません');

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
