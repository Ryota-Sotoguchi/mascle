// ========================================
// Component: NewSessionForm
// ========================================
import { useState } from 'react';
import type { CreateWorkoutSessionInput } from '../types';

const BODY_WEIGHT_KEY = 'mascle_default_body_weight';

interface Props {
  onSubmit: (input: CreateWorkoutSessionInput) => Promise<unknown>;
  defaultBodyWeightKg?: number;
}

export function NewSessionForm({ onSubmit, defaultBodyWeightKg }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [bodyWeightKg, setBodyWeightKg] = useState(() => {
    if (defaultBodyWeightKg && defaultBodyWeightKg > 0) return String(defaultBodyWeightKg);
    return localStorage.getItem(BODY_WEIGHT_KEY) ?? '';
  });
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bodyWeightKg) return;

    setSubmitting(true);
    await onSubmit({
      date,
      bodyWeightKg: parseFloat(bodyWeightKg),
      note: note || undefined,
    });
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-lg font-bold text-gray-800">📝 新しいセッション</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">日付</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="label">体重 (kg)</label>
          <input
            type="number"
            step="0.1"
            min="20"
            max="300"
            value={bodyWeightKg}
            onChange={e => setBodyWeightKg(e.target.value)}
            className="input-field"
            placeholder="70.0"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">メモ (任意)</label>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="input-field"
          placeholder="例: 胸の日、調子良い"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !bodyWeightKg}
        className="btn-primary w-full"
      >
        {submitting ? '作成中...' : 'セッション開始'}
      </button>
    </form>
  );
}
