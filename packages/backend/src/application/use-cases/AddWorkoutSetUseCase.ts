// ========================================
// Use Case: AddWorkoutSet
// ========================================
import type { IWorkoutSessionRepository } from '../../domain/repositories/IWorkoutSessionRepository.js';
import type { IExerciseRepository } from '../../domain/repositories/IExerciseRepository.js';
import { CalorieCalculationService } from '../../domain/services/CalorieCalculationService.js';
import { WorkoutSet } from '../../domain/entities/WorkoutSet.js';
import { UniqueId } from '../../domain/value-objects/UniqueId.js';
import type { AddWorkoutSetDTO, WorkoutSessionDTO } from '../dtos/WorkoutSessionDTO.js';
import { WorkoutSessionMapper } from '../mappers/WorkoutSessionMapper.js';

export class AddWorkoutSetUseCase {
  private readonly calorieService = new CalorieCalculationService();

  constructor(
    private readonly sessionRepo: IWorkoutSessionRepository,
    private readonly exerciseRepo: IExerciseRepository,
  ) {}

  async execute(dto: AddWorkoutSetDTO): Promise<WorkoutSessionDTO> {
    const session = await this.sessionRepo.findById(UniqueId.from(dto.sessionId));
    if (!session) throw new Error(`Session ${dto.sessionId} not found`);

    const exercise = await this.exerciseRepo.findById(UniqueId.from(dto.exerciseId));
    if (!exercise) throw new Error(`Exercise ${dto.exerciseId} not found`);

    // セット時間を推定 or 指定値を使用
    // duration/cardio 種目はユーザー入力のdurationMinutesを使用（未指定なら1分）
    const isDurationBased = exercise.inputType === 'duration' || exercise.inputType === 'cardio';
    const durationMinutes = dto.durationMinutes
      ?? (isDurationBased ? 1 : this.calorieService.estimateDurationFromSet(dto.reps, dto.restSeconds ?? 60));

    // カロリー計算
    // cardio種目: weightKg は傾斜%として格納 → MET補正に使用（loadFactorは不使用）
    // その他: weightKg は実施重量 → loadFactorに使用
    const isCardio = exercise.inputType === 'cardio';
    const weightForCalc = isCardio ? 0 : dto.weightKg;
    const inclinePct = isCardio ? dto.weightKg : 0;
    const speedKmh = isCardio ? (dto.speedKmh ?? 0) : 0;
    const caloriesBurned = this.calorieService.calculate(
      exercise,
      session.bodyWeightKg,
      durationMinutes,
      weightForCalc,
      inclinePct,
      speedKmh,
    );

    const set = WorkoutSet.create({
      exerciseId: UniqueId.from(dto.exerciseId),
      setNumber: session.totalSets + 1,
      reps: dto.reps,
      weightKg: dto.weightKg,
      durationMinutes,
      caloriesBurned,
      speedKmh,
    });

    session.addSet(set);
    await this.sessionRepo.update(session);

    // エクササイズ名を取得してDTOに含める
    const exerciseNames = new Map<string, { name: string; nameJa: string }>();
    const exercises = await this.exerciseRepo.findAll();
    for (const ex of exercises) {
      exerciseNames.set(ex.id.value, { name: ex.name, nameJa: ex.nameJa });
    }

    return WorkoutSessionMapper.toDTO(session, exerciseNames);
  }
}
