// ========================================
// Component: Sidebar ナビゲーション
// ========================================
import type { AuthUser } from '../context/AuthContext';

export type Page = 'dashboard' | 'workout' | 'history' | 'profile';

interface NavItem {
  page: Page;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { page: 'dashboard', icon: '🏠', label: 'ホーム' },
  { page: 'workout',   icon: '💪', label: 'トレーニング' },
  { page: 'history',   icon: '📋', label: '履歴' },
  { page: 'profile',   icon: '👤', label: 'プロフィール' },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
}

export function Sidebar({ currentPage, onNavigate, isOpen, onClose, user }: SidebarProps) {
  const handleNav = (page: Page) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      {/* モバイル用オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドバー本体 */}
      <aside
        className={[
          'fixed top-0 left-0 h-full z-30 flex flex-col',
          'bg-white border-r border-gray-200 shadow-xl',
          'w-60 transition-transform duration-200 ease-in-out',
          // デスクトップ: 常に表示 / モバイル: isOpen で制御
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* ロゴエリア */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <span className="text-3xl">🏋️</span>
          <div>
            <p className="font-bold text-gray-800 leading-tight">Mascle</p>
            <p className="text-gray-400 text-xs">筋トレ記録 & カロリー計算</p>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                ].join(' ')}
              >
                <span className="text-lg w-6 text-center">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ユーザー情報フッター */}
        <div className="border-t border-gray-100 px-4 py-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user.displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-lg">👤</span>
              <span className="text-sm">ゲストモード</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
