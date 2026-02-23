// ========================================
// Infrastructure: DI Container (Composition Root)
// ========================================
import { getDatabase } from '../database/connection.js';
import { SQLiteExerciseRepository } from '../repositories/SQLiteExerciseRepository.js';
import { SQLiteWorkoutSessionRepository } from '../repositories/SQLiteWorkoutSessionRepository.js';
import { SQLiteUserRepository } from '../repositories/SQLiteUserRepository.js';
import { GetExercisesUseCase } from '../../application/use-cases/GetExercisesUseCase.js';
import { CreateExerciseUseCase } from '../../application/use-cases/CreateExerciseUseCase.js';
import { CreateWorkoutSessionUseCase } from '../../application/use-cases/CreateWorkoutSessionUseCase.js';
import { AddWorkoutSetUseCase } from '../../application/use-cases/AddWorkoutSetUseCase.js';
import { RemoveWorkoutSetUseCase } from '../../application/use-cases/RemoveWorkoutSetUseCase.js';
import { GetWorkoutSessionsUseCase } from '../../application/use-cases/GetWorkoutSessionsUseCase.js';
import { GetWorkoutSessionByIdUseCase } from '../../application/use-cases/GetWorkoutSessionByIdUseCase.js';
import { DeleteWorkoutSessionUseCase } from '../../application/use-cases/DeleteWorkoutSessionUseCase.js';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase.js';
import { LoginUserUseCase } from '../../application/use-cases/LoginUserUseCase.js';

export interface Container {
  // Auth
  registerUser: RegisterUserUseCase;
  loginUser: LoginUserUseCase;
  // Use Cases
  getExercises: GetExercisesUseCase;
  createExercise: CreateExerciseUseCase;
  createWorkoutSession: CreateWorkoutSessionUseCase;
  addWorkoutSet: AddWorkoutSetUseCase;
  removeWorkoutSet: RemoveWorkoutSetUseCase;
  getWorkoutSessions: GetWorkoutSessionsUseCase;
  getWorkoutSessionById: GetWorkoutSessionByIdUseCase;
  deleteWorkoutSession: DeleteWorkoutSessionUseCase;
}

export function createContainer(): Container {
  const db = getDatabase();

  // Repositories (Adapters)
  const exerciseRepo = new SQLiteExerciseRepository(db);
  const sessionRepo = new SQLiteWorkoutSessionRepository(db);
  const userRepo = new SQLiteUserRepository(db);

  // Use Cases
  return {
    registerUser: new RegisterUserUseCase(userRepo),
    loginUser: new LoginUserUseCase(userRepo),
    getExercises: new GetExercisesUseCase(exerciseRepo),
    createExercise: new CreateExerciseUseCase(exerciseRepo),
    createWorkoutSession: new CreateWorkoutSessionUseCase(sessionRepo),
    addWorkoutSet: new AddWorkoutSetUseCase(sessionRepo, exerciseRepo),
    removeWorkoutSet: new RemoveWorkoutSetUseCase(sessionRepo, exerciseRepo),
    getWorkoutSessions: new GetWorkoutSessionsUseCase(sessionRepo, exerciseRepo),
    getWorkoutSessionById: new GetWorkoutSessionByIdUseCase(sessionRepo, exerciseRepo),
    deleteWorkoutSession: new DeleteWorkoutSessionUseCase(sessionRepo),
  };
}
