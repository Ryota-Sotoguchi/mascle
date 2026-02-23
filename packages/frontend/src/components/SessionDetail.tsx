// ========================================
// Component: SessionDetail
// ========================================
import type { WorkoutSession, AddWorkoutSetInput } from '../types';
import { AddSetForm } from './AddSetForm';

interface Props {
  session: WorkoutSession;
  onAddSet: (input: AddWorkoutSetInput) => Promise<unknown>;
  onRemoveSet: (setId: string) => Promise<unknown>;
  onBack: () => void;
}

export function SessionDetail({ session, onAddSet, onRemoveSet, onBack }: Props) {
  // セットをエクササイズごとにグループ化
  const groupedSets = session.sets.reduce<
    Record<string, typeof session.sets>
  >((acc, set) => {
    const key = set.exerciseNameJa || set.exerciseId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(set);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn-secondary text-sm">
          ← 戻る
        </button>
        <div>
          <h2 className="text-lg font-bold">
            {new Date(session.date).toLocaleDateString('ja-JP', {
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
            のワークアウト
          </h2>
          {session.note && (
            <p className="text-sm text-gray-500">{session.note}</p>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="消費カロリー"
          value={`${session.totalCaloriesBurned}`}
          unit="kcal"
          icon="🔥"
          color="bg-orange-50 text-orange-700"
        />
        <SummaryCard
          label="総セット数"
          value={`${session.totalSets}`}
          unit="sets"
          icon="📊"
          color="bg-blue-50 text-blue-700"
        />
        <SummaryCard
          label="総ボリューム"
          value={`${session.totalVolume.toLocaleString()}`}
          unit="kg"
          icon="💪"
          color="bg-purple-50 text-purple-700"
        />
        <SummaryCard
          label="合計時間"
          value={`${Math.round(session.totalDurationMinutes)}`}
          unit="分"
          icon="⏱️"
          color="bg-green-50 text-green-700"
        />
      </div>

      {/* セット一覧 */}
      {Object.keys(groupedSets).length > 0 && (
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">📋 記録されたセット</h3>
          <div className="space-y-4">
            {Object.entries(groupedSets).map(([exerciseName, sets]) => {
              // セットの特性を判定
              const isTimeBased = sets.every(s => s.reps === 0);
              const hasWeightOrIncline = sets.some(s => s.weightKg > 0);
              const hasSpeed = sets.some(s => s.speedKmh > 0);
              return (
                <div key={exerciseName} className="border-b border-gray-100 pb-3 last:border-0">
                  <h4 className="font-medium text-gray-700 mb-2">{exerciseName}</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="pr-4 py-1">Set</th>
                          {isTimeBased ? (
                            <>
                              <th className="pr-4 py-1">時間</th>
                              {hasSpeed && <th className="pr-4 py-1">速度</th>}
                              {hasWeightOrIncline && <th className="pr-4 py-1">傾斜/負荷</th>}
                            </>
                          ) : (
                            <>
                              <th className="pr-4 py-1">レップ</th>
                              {hasWeightOrIncline && <th className="pr-4 py-1">重量</th>}
                              <th className="pr-4 py-1">時間</th>
                            </>
                          )}
                          <th className="pr-4 py-1">カロリー</th>
                          <th className="py-1"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {sets.map(set => (
                          <tr key={set.id} className="border-t border-gray-50">
                            <td className="pr-4 py-1">{set.setNumber}</td>
                            {isTimeBased ? (
                              <>
                                <td className="pr-4 py-1">
                                  {set.durationMinutes >= 1
                                    ? `${set.durationMinutes.toFixed(1)} 分`
                                    : `${Math.round(set.durationMinutes * 60)} 秒`}
                                </td>
                                {hasSpeed && (
                                  <td className="pr-4 py-1">
                                    {set.speedKmh > 0 ? `${set.speedKmh} km/h` : '—'}
                                  </td>
                                )}
                                {hasWeightOrIncline && (
                                  <td className="pr-4 py-1">{set.weightKg > 0 ? `${set.weightKg} %` : '—'}</td>
                                )}
                              </>
                            ) : (
                              <>
                                <td className="pr-4 py-1">{set.reps} reps</td>
                                {hasWeightOrIncline && (
                                  <td className="pr-4 py-1">{set.weightKg > 0 ? `${set.weightKg} kg` : '—'}</td>
                                )}
                                <td className="pr-4 py-1">{set.durationMinutes.toFixed(1)} 分</td>
                              </>
                            )}
                            <td className="pr-4 py-1 text-orange-600 font-medium">
                              {set.caloriesBurned.toFixed(1)} kcal
                            </td>
                            <td className="py-1">
                              <button
                                onClick={() => onRemoveSet(set.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors text-xs px-1"
                                title="このセットを削除"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* セット追加フォーム */}
      <AddSetForm onSubmit={onAddSet} />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  unit,
  icon,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">
        {value}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </div>
      <div className="text-xs opacity-75">{label}</div>
    </div>
  );
}
