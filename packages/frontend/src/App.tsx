// ========================================
// App Root Component
// ========================================
import { useState } from 'react';
import { Sidebar, type Page } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthForm } from './components/AuthForm';
import { useWorkoutSessions } from './hooks/useWorkoutSessions';
import { useAuth } from './context/AuthContext';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'ホーム',
  workout: 'トレーニング',
  history: '履歴',
  profile: 'プロフィール',
};

export default function App() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const {
    sessions,
    currentSession,
    setCurrentSession,
    loading,
    error,
    dateFrom,
    dateTo,
    createSession,
    addSet,
    removeSet,
    deleteSession,
    selectSession,
    applyDateFilter,
  } = useWorkoutSessions();

  // Dashboard / History からセッション選択 → Workout ページへ遷移
  const handleSelectSession = (id: string) => {
    selectSession(id);
    setCurrentPage('workout');
  };

  // プロフィールで保存したデフォルト体重を読み出し
  const defaultBodyWeightKg = (() => {
    const raw = localStorage.getItem('mascle_default_body_weight');
    const val = raw ? parseFloat(raw) : NaN;
    return isNaN(val) ? undefined : val;
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* サイドバー */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      {/* メインコンテンツエリア（デスクトップはサイドバー分右へ） */}
      <div className="md:pl-60 flex flex-col min-h-screen">
        {/* モバイル専用トップバー */}
        <Header
          onMenuOpen={() => setSidebarOpen(true)}
          title={PAGE_TITLES[currentPage]}
        />

        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
          {currentPage === 'dashboard' && (
            <DashboardPage
              sessions={sessions}
              loading={loading}
              user={user}
              onNavigate={setCurrentPage}
              onSelectSession={handleSelectSession}
              onOpenAuth={openAuth}
            />
          )}
          {currentPage === 'workout' && (
            <WorkoutPage
              currentSession={currentSession}
              error={error}
              defaultBodyWeightKg={defaultBodyWeightKg}
              onCreateSession={createSession}
              onAddSet={addSet}
              onRemoveSet={removeSet}
              onBack={() => setCurrentSession(null)}
            />
          )}
          {currentPage === 'history' && (
            <HistoryPage
              sessions={sessions}
              loading={loading}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onApplyFilter={applyDateFilter}
              onSelect={handleSelectSession}
              onDelete={deleteSession}
            />
          )}
          {currentPage === 'profile' && (
            <ProfilePage
              user={user}
              sessions={sessions}
              onLogin={() => openAuth('login')}
              onRegister={() => openAuth('register')}
              onLogout={logout}
            />
          )}
        </main>

        <footer className="text-center text-gray-400 text-xs py-4">
          Mascle v1.0 - 筋トレ記録 & カロリー計算
        </footer>
      </div>

      {showAuth && <AuthForm defaultMode={authMode} onClose={() => setShowAuth(false)} />}
    </div>
  );
}
