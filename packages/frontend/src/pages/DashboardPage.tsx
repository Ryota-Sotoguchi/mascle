// ========================================
// Page: Dashboard（ホーム）
// ========================================
import type { WorkoutSession } from '../types';
import type { Page } from '../components/Sidebar';
import type { AuthUser } from '../context/AuthContext';

interface DashboardPageProps {
  sessions: WorkoutSession[];
  loading: boolean;
  user: AuthUser | null;
  onNavigate: (page: Page) => void;
  onSelectSession: (id: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

function getGreeting(hour: number): string {
  if (hour < 5)  return 'こんばんは';
  if (hour < 11) return 'おはようございます';
  if (hour < 17) return 'こんにちは';
  return 'こんばんは';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
}

export function DashboardPage({ sessions, loading, user, onNavigate, onSelectSession, onOpenAuth }: DashboardPageProps) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const greeting = getGreeting(now.getHours());
  const name = user?.displayName ?? 'ゲスト';

  // 今日のセッション
  const todaySessions = sessions.filter(s => s.date.startsWith(todayStr));
  const todayCalories  = Math.round(todaySessions.reduce((sum, s) => sum + s.totalCaloriesBurned, 0) * 10) / 10;
  const todayDuration  = Math.round(todaySessions.reduce((sum, s) => sum + s.totalDurationMinutes, 0) * 10) / 10;
  const todaySets      = todaySessions.reduce((sum, s) => sum + s.totalSets, 0);

  // 今週 (月〜今日) の集計
  const dayOfWeek = now.getDay(); // 0=日
  const daysFromMonday = (dayOfWeek + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysFromMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekSessions = sessions.filter(s => new Date(s.date) >= weekStart);
  const weekCalories  = Math.round(weekSessions.reduce((sum, s) => sum + s.totalCaloriesBurned, 0) * 10) / 10;
  const weekSessionCount = weekSessions.length;

  // 直近3セッション（今日を除く）
  const recentSessions = sessions.filter(s => !s.date.startsWith(todayStr)).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 挨拶ヘッダー */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl text-white px-6 py-6">
        <p className="text-primary-200 text-sm">
          {now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
        <h2 className="mt-1 text-2xl font-bold">{greeting}、{name} 👋</h2>
        <p className="mt-1 text-primary-200 text-sm">
          {todaySessions.length > 0
            ? `今日は ${todaySessions.length} セッション記録済み！`
            : '今日のトレーニングを記録しましょう。'}
        </p>
        <button
          onClick={() => onNavigate('workout')}
          className="mt-4 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors"
        >
          💪 トレーニングを記録する
        </button>
      </div>

      {/* ゲストバナー */}
      {!user && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-amber-800">🔓 ゲストモード — データはページを閉じると消えます</p>
          <button
            onClick={() => onOpenAuth('register')}
            className="shrink-0 text-sm font-medium text-amber-700 border border-amber-400 rounded-lg px-3 py-1 hover:bg-amber-100 transition-colors"
          >
            無料登録
          </button>
        </div>
      )}

      {/* 今日のサマリー */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">今日のアクティビティ</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon="🔥" value={`${todayCalories}`} unit="kcal" label="消費カロリー" />
          <StatCard icon="⏱️" value={`${todayDuration}`} unit="分" label="トレーニング時間" />
          <StatCard icon="📊" value={`${todaySets}`} unit="セット" label="総セット数" />
        </div>
      </div>

      {/* 今週のサマリー */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">今週の実績</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="📅" value={`${weekSessionCount}`} unit="回" label="セッション数" />
          <StatCard icon="🔥" value={`${weekCalories}`} unit="kcal" label="消費カロリー合計" />
        </div>
      </div>

      {/* 直近セッション */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">最近の記録</h3>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-primary-600 hover:text-primary-800 transition-colors"
          >
            すべて見る →
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-4">読み込み中...</p>
        ) : recentSessions.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-sm">まだ記録がありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map(session => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className="card w-full text-left hover:shadow-md transition-shadow flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{formatDate(session.date)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{session.totalSets} セット</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary-600">{session.totalCaloriesBurned} kcal</p>
                  <p className="text-xs text-gray-400">{session.totalDurationMinutes} 分</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, value, unit, label }: { icon: string; value: string; unit: string; label: string }) {
  return (
    <div className="card py-3 px-3 text-center">
      <p className="text-xl mb-1">{icon}</p>
      <p className="text-lg font-bold text-gray-800 leading-tight">
        {value} <span className="text-xs font-normal text-gray-500">{unit}</span>
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
