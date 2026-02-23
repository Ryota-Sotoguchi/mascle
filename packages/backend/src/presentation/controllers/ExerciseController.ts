// ========================================
// Presentation: Exercise Controller
// ========================================
import type { Request, Response } from 'express';
import type { Container } from '../../infrastructure/di/container.js';
import type { MuscleGroup } from '../../domain/entities/Exercise.js';

export class ExerciseController {
  constructor(private readonly container: Container) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const muscleGroup = req.query.muscleGroup as MuscleGroup | undefined;
      const exercises = await this.container.getExercises.execute(muscleGroup);
      res.json({ data: exercises });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const exercise = await this.container.createExercise.execute(req.body);
      res.status(201).json({ data: exercise });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
