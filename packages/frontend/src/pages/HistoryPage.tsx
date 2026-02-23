// ========================================
// Page: History（履歴）
// ========================================
import type { WorkoutSession } from '../types';
import { SessionList } from '../components/SessionList';

interface HistoryPageProps {
  sessions: WorkoutSession[];
  loading: boolean;
  dateFrom: string;
  dateTo: string;
  onApplyFilter: (from: string, to: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryPage({
  sessions,
  loading,
  dateFrom,
  dateTo,
  onApplyFilter,
  onSelect,
  onDelete,
}: HistoryPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">📋 トレーニング履歴</h2>
        <p className="text-sm text-gray-500 mt-1">過去のセッションを確認・管理できます</p>
      </div>

      {/* 期間フィルター */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">🔍 期間で絞り込む</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">開始</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => onApplyFilter(e.target.value, dateTo)}
              className="input-field text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">終了</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => onApplyFilter(dateFrom, e.target.value)}
              className="input-field text-sm"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => onApplyFilter('', '')}
              className="btn-secondary text-sm"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* セッション一覧 */}
      <SessionList
        sessions={sessions}
        loading={loading}
        onSelect={onSelect}
        onDelete={id => {
          if (confirm('このセッションを削除しますか？')) {
            onDelete(id);
          }
        }}
      />
    </div>
  );
}
