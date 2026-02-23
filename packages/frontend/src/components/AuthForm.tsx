// ========================================
// Component: AuthForm (ログイン / 新規登録 モーダル)
// ========================================
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthFormProps {
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export function AuthForm({ onClose, defaultMode = 'register' }: AuthFormProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '認証に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    // オーバーレイ背景
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {mode === 'login' ? 'ログイン' : '新規登録'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {mode === 'login'
                ? 'データが復元されます'
                : 'アカウントを作成してデータを保存'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* タブ切替 */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            新規登録
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="例: 田中太郎"
                required
                className="input-field w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
              {mode === 'register' && <span className="text-gray-400 ml-1 text-xs">(8文字以上)</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={mode === 'register' ? 8 : undefined}
              className="input-field w-full"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading
              ? '処理中...'
              : mode === 'login' ? 'ログイン' : 'アカウント作成'}
          </button>
        </form>
      </div>
    </div>
  );
}
