// ========================================
// Presentation: Auth Controller
// ========================================
import type { Request, Response } from 'express';
import type { Container } from '../../infrastructure/di/container.js';

export class AuthController {
  constructor(private readonly container: Container) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.container.registerUser.execute(req.body);
      res.status(201).json({ data: result });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.container.loginUser.execute(req.body);
      res.json({ data: result });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    // requireAuth ミドルウェアで検証済み
    res.json({ data: req.auth });
  };
}
