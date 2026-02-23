// ========================================
// Page: Workout（トレーニング記録）
// ========================================
import type { WorkoutSession, CreateWorkoutSessionInput, AddWorkoutSetInput } from '../types';
import { NewSessionForm } from '../components/NewSessionForm';
import { SessionDetail } from '../components/SessionDetail';

interface WorkoutPageProps {
  currentSession: WorkoutSession | null;
  error: string | null;
  defaultBodyWeightKg?: number;
  onCreateSession: (input: CreateWorkoutSessionInput) => Promise<unknown>;
  onAddSet: (sessionId: string, input: AddWorkoutSetInput) => Promise<unknown>;
  onRemoveSet: (sessionId: string, setId: string) => Promise<unknown>;
  onBack: () => void;
}

export function WorkoutPage({
  currentSession,
  error,
  defaultBodyWeightKg,
  onCreateSession,
  onAddSet,
  onRemoveSet,
  onBack,
}: WorkoutPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">💪 トレーニング記録</h2>
        <p className="text-sm text-gray-500 mt-1">セッションを作成してセットを記録しましょう</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {currentSession ? (
        <SessionDetail
          session={currentSession}
          onAddSet={input => onAddSet(currentSession.id, input)}
          onRemoveSet={setId => onRemoveSet(currentSession.id, setId)}
          onBack={onBack}
        />
      ) : (
        <NewSessionForm
          onSubmit={onCreateSession}
          defaultBodyWeightKg={defaultBodyWeightKg}
        />
      )}
    </div>
  );
}
