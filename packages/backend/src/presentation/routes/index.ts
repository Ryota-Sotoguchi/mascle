// ========================================
// Presentation: Express Routes
// ========================================
import { Router } from 'express';
import type { Container } from '../../infrastructure/di/container.js';
import { ExerciseController } from '../controllers/ExerciseController.js';
import { WorkoutSessionController } from '../controllers/WorkoutSessionController.js';
import { AuthController } from '../controllers/AuthController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export function createRoutes(container: Container): Router {
  const router = Router();
  const exerciseCtrl = new ExerciseController(container);
  const sessionCtrl = new WorkoutSessionController(container);
  const authCtrl = new AuthController(container);

  // Auth routes (public)
  router.post('/auth/register', authCtrl.register);
  router.post('/auth/login', authCtrl.login);
  router.get('/auth/me', requireAuth, authCtrl.me);

  // Exercise routes (public - reference data)
  router.get('/exercises', exerciseCtrl.getAll);
  router.post('/exercises', exerciseCtrl.create);

  // Workout Session routes (protected)
  router.get('/sessions', requireAuth, sessionCtrl.getAll);
  router.get('/sessions/:id', requireAuth, sessionCtrl.getById);
  router.post('/sessions', requireAuth, sessionCtrl.create);
  router.post('/sessions/:id/sets', requireAuth, sessionCtrl.addSet);
  router.delete('/sessions/:id/sets/:setId', requireAuth, sessionCtrl.removeSet);
  router.delete('/sessions/:id', requireAuth, sessionCtrl.delete);

  return router;
}
