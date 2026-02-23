// ========================================
// Component: Header（モバイル用トップバー）
// ========================================
interface HeaderProps {
  onMenuOpen: () => void;
  title?: string;
}

export function Header({ onMenuOpen, title }: HeaderProps) {
  return (
    <header className="md:hidden bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg">
      <div className="px-4 py-3 flex items-center gap-3">
        {/* ハンバーガーボタン */}
        <button
          onClick={onMenuOpen}
          className="p-1.5 rounded-md hover:bg-primary-500 transition-colors"
          aria-label="メニューを開く"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏋️</span>
          <div>
            <p className="font-bold text-sm leading-tight">{title ?? 'Mascle'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

