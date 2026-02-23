// ========================================
// Presentation: WorkoutSession Controller
// ========================================
import type { Request, Response } from 'express';
import type { Container } from '../../infrastructure/di/container.js';

// Express 5 params helper
function param(req: Request, key: string): string {
  return req.params[key] as string;
}

export class WorkoutSessionController {
  constructor(private readonly container: Container) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { from, to } = req.query;
      const sessions = await this.container.getWorkoutSessions.execute(
        req.auth!.userId,
        from as string | undefined,
        to as string | undefined,
      );
      res.json({ data: sessions });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const session = await this.container.getWorkoutSessionById.execute(param(req, 'id'));
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      res.json({ data: session });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const session = await this.container.createWorkoutSession.execute({
        ...req.body,
        userId: req.auth!.userId,
      });
      res.status(201).json({ data: session });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  addSet = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = {
        sessionId: param(req, 'id'),
        ...req.body,
      };
      const session = await this.container.addWorkoutSet.execute(dto);
      res.json({ data: session });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  removeSet = async (req: Request, res: Response): Promise<void> => {
    try {
      const session = await this.container.removeWorkoutSet.execute(
        param(req, 'id'),
        param(req, 'setId'),
      );
      res.json({ data: session });
    } catch (error) {
      const msg = (error as Error).message;
      const status = msg.includes('not found') ? 404 : 400;
      res.status(status).json({ error: msg });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.container.deleteWorkoutSession.execute(param(req, 'id'));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}

