// ========================================
// Component: AddSetForm
// ========================================
import { useState, useEffect } from 'react';
import type { Exercise, AddWorkoutSetInput, MuscleGroup } from '../types';
import { MUSCLE_GROUP_LABELS } from '../types';
import { useExercises } from '../hooks/useExercises';

interface Props {
  onSubmit: (input: AddWorkoutSetInput) => Promise<unknown>;
}

/** inputType ごとのラベル・バッジ */
const INPUT_TYPE_BADGE: Record<string, { label: string; color: string }> = {
  reps_weight: { label: '重量', color: 'bg-blue-100 text-blue-700' },
  reps_only:   { label: '自重', color: 'bg-green-100 text-green-700' },
  duration:    { label: '時間', color: 'bg-purple-100 text-purple-700' },
  cardio:      { label: '有酸素', color: 'bg-orange-100 text-orange-700' },
};

export function AddSetForm({ onSubmit }: Props) {
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | undefined>(undefined);
  const { exercises, loading } = useExercises(muscleFilter);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // reps_weight / reps_only 用
  const [reps, setReps] = useState('');
  const [weightKg, setWeightKg] = useState('');

  // duration 用（秒）
  const [durationSecs, setDurationSecs] = useState('');

  // cardio 用（分 + 速度km/h + 傾斜/負荷%）
  const [cardioMins, setCardioMins] = useState('');
  const [speed, setSpeed] = useState('');
  const [incline, setIncline] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // 種目が変わったらフィールドをリセット
  useEffect(() => {
    setReps('');
    setWeightKg('');
    setDurationSecs('');
    setCardioMins('');
    setSpeed('');
    setIncline('');
  }, [selectedExercise?.id]);

  const inputType = selectedExercise?.inputType ?? 'reps_weight';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;

    let input: AddWorkoutSetInput;

    if (inputType === 'duration') {
      const secs = parseFloat(durationSecs);
      if (!secs || secs <= 0) return;
      input = {
        exerciseId: selectedExercise.id,
        reps: 0,
        weightKg: 0,
        durationMinutes: secs / 60,
      };
    } else if (inputType === 'cardio') {
      const mins = parseFloat(cardioMins);
      if (!mins || mins <= 0) return;
      input = {
        exerciseId: selectedExercise.id,
        reps: 0,
        weightKg: parseFloat(incline) || 0,
        speedKmh: parseFloat(speed) || 0,
        durationMinutes: mins,
      };
    } else if (inputType === 'reps_only') {
      if (!reps) return;
      input = {
        exerciseId: selectedExercise.id,
        reps: parseInt(reps),
        weightKg: 0,
      };
    } else {
      // reps_weight
      if (!reps) return;
      input = {
        exerciseId: selectedExercise.id,
        reps: parseInt(reps),
        weightKg: parseFloat(weightKg) || 0,
      };
    }

    setSubmitting(true);
    await onSubmit(input);
    setSubmitting(false);
    setReps('');
    setWeightKg('');
    setDurationSecs('');
    setCardioMins('');
    setSpeed('');
    setIncline('');
  };

  const badge = INPUT_TYPE_BADGE[inputType] ?? INPUT_TYPE_BADGE.reps_weight;

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="text-lg font-bold text-gray-800">➕ セットを追加</h3>

      {/* 部位フィルター */}
      <div>
        <label className="label">部位で絞り込み</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMuscleFilter(undefined)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              !muscleFilter
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {(Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]).map(group => (
            <button
              key={group}
              type="button"
              onClick={() => setMuscleFilter(group)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                muscleFilter === group
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {MUSCLE_GROUP_LABELS[group]}
            </button>
          ))}
        </div>
      </div>

      {/* エクササイズ選択 */}
      <div>
        <label className="label">エクササイズ</label>
        {loading ? (
          <p className="text-gray-400">読込中...</p>
        ) : (
          <select
            className="input-field"
            value={selectedExercise?.id || ''}
            onChange={e => {
              const ex = exercises.find(ex => ex.id === e.target.value);
              setSelectedExercise(ex || null);
            }}
            required
          >
            <option value="">選択してください</option>
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id}>
                {ex.nameJa} ({ex.name})
              </option>
            ))}
          </select>
        )}
        {selectedExercise && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.color}`}>
              {badge.label}
            </span>
            {selectedExercise.description && (
              <span className="text-xs text-gray-500">{selectedExercise.description}</span>
            )}
          </div>
        )}
      </div>

      {/* ---- duration: 保持時間（秒）---- */}
      {inputType === 'duration' && (
        <div>
          <label className="label">保持時間（秒）</label>
          <input
            type="number"
            min="1"
            step="1"
            value={durationSecs}
            onChange={e => setDurationSecs(e.target.value)}
            className="input-field"
            placeholder="例: 60（1分）"
            required
          />
          {durationSecs && (
            <p className="mt-1 text-xs text-gray-500">
              = {(parseFloat(durationSecs) / 60).toFixed(2)} 分
            </p>
          )}
        </div>
      )}

      {/* ---- cardio: 時間（分）+ 速度 + 傾斜/負荷 ---- */}
      {inputType === 'cardio' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">時間（分）</label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={cardioMins}
                onChange={e => setCardioMins(e.target.value)}
                className="input-field"
                placeholder="例: 20"
                required
              />
            </div>
            <div>
              <label className="label">
                速度 (km/h)
                <span className="ml-1 text-xs text-gray-400">任意</span>
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={speed}
                onChange={e => setSpeed(e.target.value)}
                className="input-field"
                placeholder="例: 10"
              />
            </div>
          </div>
          <div>
            <label className="label">
              傾斜 / 負荷 (%)
              <span className="ml-1 text-xs text-gray-400">任意</span>
            </label>
            <input
              type="number"
              min="0"
              max="30"
              step="0.5"
              value={incline}
              onChange={e => setIncline(e.target.value)}
              className="input-field"
              placeholder="例: 5"
            />
          </div>
          {/* リアルタイムプレビュー */}
          {cardioMins && parseFloat(cardioMins) > 0 && (() => {
            const sp = parseFloat(speed) || 0;
            const inc = parseFloat(incline) || 0;
            const mins = parseFloat(cardioMins);
            if (sp > 0) {
              const speedMpm = sp * (1000 / 60);
              const grade = inc / 100;
              const hCoeff = sp >= 8 ? 0.2 : 0.1;
              const vCoeff = sp >= 8 ? 0.9 : 1.8;
              const vo2 = speedMpm * hCoeff + speedMpm * grade * vCoeff + 3.5;
              const met = vo2 / 3.5;
              return (
                <p className="text-xs text-orange-600">
                  💡 ACSM公式: MET ≈ {met.toFixed(1)}
                  {sp >= 8 ? ' (ランニング)' : ' (ウォーキング)'}
                  {inc > 0 ? `・傾斜${inc}%` : ''}
                  {` × ${mins}分`}
                </p>
              );
            } else if (inc > 0) {
              return (
                <p className="text-xs text-orange-600">
                  💡 傾斜 {inc}% → MET +{(inc * 0.5).toFixed(1)} 補正
                </p>
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* ---- reps_only: レップ数のみ ---- */}
      {inputType === 'reps_only' && (
        <div>
          <label className="label">レップ数</label>
          <input
            type="number"
            min="1"
            value={reps}
            onChange={e => setReps(e.target.value)}
            className="input-field"
            placeholder="例: 15"
            required
          />
        </div>
      )}

      {/* ---- reps_weight: レップ + 重量 ---- */}
      {inputType === 'reps_weight' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">レップ数</label>
            <input
              type="number"
              min="1"
              value={reps}
              onChange={e => setReps(e.target.value)}
              className="input-field"
              placeholder="例: 10"
              required
            />
          </div>
          <div>
            <label className="label">重量 (kg)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={weightKg}
              onChange={e => setWeightKg(e.target.value)}
              className="input-field"
              placeholder="例: 60"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !selectedExercise}
        className="btn-primary w-full"
      >
        {submitting ? '追加中...' : 'セットを記録'}
      </button>
    </form>
  );
}
