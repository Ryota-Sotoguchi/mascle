// ========================================
// Component: SessionList
// ========================================
import type { WorkoutSession } from '../types';

interface Props {
  sessions: WorkoutSession[];
  loading: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SessionList({ sessions, loading, onSelect, onDelete }: Props) {
  if (loading) {
    return (
      <div className="card text-center text-gray-400 py-8">
        読込中...
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-4xl mb-2">🏋️‍♂️</p>
        <p className="text-gray-500">まだワークアウトの記録がありません</p>
        <p className="text-gray-400 text-sm mt-1">上のフォームからセッションを開始しましょう！</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-800">📅 ワークアウト履歴</h2>
      {sessions.map(session => (
        <div
          key={session.id}
          className="card flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelect(session.id)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-800">
                {new Date(session.date).toLocaleDateString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short',
                })}
              </span>
              {session.note && (
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {session.note}
                </span>
              )}
            </div>
            <div className="flex gap-4 mt-1 text-sm text-gray-500">
              <span>🔥 {session.totalCaloriesBurned} kcal</span>
              <span>📊 {session.totalSets} sets</span>
              <span>💪 {session.totalVolume.toLocaleString()} kg</span>
              <span>⚖️ {session.bodyWeightKg} kg</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete(session.id);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="削除"
            >
              🗑️
            </button>
            <span className="text-gray-400">→</span>
          </div>
        </div>
      ))}
    </div>
  );
}
