// ========================================
// Page: Profile（プロフィール・設定）
// ========================================
import { useState } from 'react';
import type { AuthUser } from '../context/AuthContext';
import type { WorkoutSession } from '../types';

const BODY_WEIGHT_KEY = 'mascle_default_body_weight';
const HEIGHT_KEY = 'mascle_height_cm';

interface ProfilePageProps {
  user: AuthUser | null;
  sessions: WorkoutSession[];
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

function getBmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: '低体重',           color: 'text-blue-500' };
  if (bmi < 25.0) return { label: '普通体重',          color: 'text-green-600' };
  if (bmi < 30.0) return { label: '肥満（1度）',       color: 'text-yellow-500' };
  return            { label: '肥満（2度以上）',         color: 'text-red-500' };
}

export function ProfilePage({ user, sessions, onLogin, onRegister, onLogout }: ProfilePageProps) {
  const [bodyWeight, setBodyWeight] = useState<string>(
    () => localStorage.getItem(BODY_WEIGHT_KEY) ?? ''
  );
  const [height, setHeight] = useState<string>(
    () => localStorage.getItem(HEIGHT_KEY) ?? ''
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const w = parseFloat(bodyWeight);
    const h = parseFloat(height);
    if (!isNaN(w) && w > 0) localStorage.setItem(BODY_WEIGHT_KEY, String(w));
    if (!isNaN(h) && h > 0) localStorage.setItem(HEIGHT_KEY, String(h));
    if ((!isNaN(w) && w > 0) || (!isNaN(h) && h > 0)) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  // BMI 計算
  const bmiWeight = parseFloat(bodyWeight);
  const bmiHeight = parseFloat(height);
  const bmi =
    !isNaN(bmiWeight) && bmiWeight > 0 && !isNaN(bmiHeight) && bmiHeight > 0
      ? bmiWeight / Math.pow(bmiHeight / 100, 2)
      : null;
  const standardWeight =
    !isNaN(bmiHeight) && bmiHeight > 0
      ? Math.round(Math.pow(bmiHeight / 100, 2) * 22 * 10) / 10
      : null;

  // 統計
  const totalSessions  = sessions.length;
  const totalCalories  = Math.round(sessions.reduce((s, x) => s + x.totalCaloriesBurned, 0) * 10) / 10;
  const totalSets      = sessions.reduce((s, x) => s + x.totalSets, 0);
  const totalVolume    = Math.round(sessions.reduce((s, x) => s + x.totalVolume, 0));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">👤 プロフィール</h2>
        <p className="text-sm text-gray-500 mt-1">アカウント情報と設定を管理します</p>
      </div>

      {/* ユーザー情報 */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-4">アカウント</h3>
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user.displayName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full mt-2 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              ログアウト
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-xl">🔓</span>
              <div>
                <p className="text-sm font-medium text-amber-800">ゲストモードで利用中</p>
                <p className="text-xs text-amber-600">登録するとデータがクラウドに保存されます</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onRegister}
                className="btn-primary text-sm py-2.5"
              >
                無料登録
              </button>
              <button
                onClick={onLogin}
                className="btn-secondary text-sm py-2.5"
              >
                ログイン
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 身体情報 */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-1">⚖️ 身体情報</h3>
        <p className="text-xs text-gray-400 mb-3">体重はセッション作成時に自動入力されます</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="label">体重</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="20"
                max="200"
                step="0.1"
                value={bodyWeight}
                onChange={e => setBodyWeight(e.target.value)}
                placeholder="例: 70"
                className="input-field flex-1"
              />
              <span className="text-sm text-gray-500 shrink-0">kg</span>
            </div>
          </div>
          <div>
            <label className="label">身長</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="100"
                max="250"
                step="0.1"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="例: 170"
                className="input-field flex-1"
              />
              <span className="text-sm text-gray-500 shrink-0">cm</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={!bodyWeight && !height}
          className="btn-primary w-full text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saved ? '✅ 保存済み' : '保存'}
        </button>
      </div>

      {/* BMI カード */}
      {bmi !== null && (() => {
        const cat = getBmiCategory(bmi);
        return (
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-3">📏 BMI</h3>
            <div className="flex items-center justify-between gap-4">
              <div className="text-center flex-1">
                <p className={`text-4xl font-bold ${cat.color}`}>{bmi.toFixed(1)}</p>
                <p className={`text-sm font-medium mt-1 ${cat.color}`}>{cat.label}</p>
              </div>
              <div className="flex-1 space-y-1 text-sm text-gray-600">
                {standardWeight !== null && (
                  <p>標準体重：<span className="font-semibold text-gray-800">{standardWeight} kg</span></p>
                )}
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  &lt;18.5 低体重　18.5–24.9 普通<br />
                  25–29.9 肥満1度　≥30 肥満2度
                </p>
              </div>
            </div>
            {/* BMI バー */}
            <div className="mt-4">
              <div className="h-2 rounded-full bg-gradient-to-r from-blue-300 via-green-400 via-yellow-400 to-red-500 relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-700 shadow"
                  style={{ left: `${Math.min(Math.max((bmi - 15) / (40 - 15), 0), 1) * 100}%`, transform: 'translate(-50%, -50%)' }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 累計統計 */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-4">📊 累計実績</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatRow label="総セッション数" value={`${totalSessions} 回`} />
          <StatRow label="総セット数" value={`${totalSets} セット`} />
          <StatRow label="総消費カロリー" value={`${totalCalories} kcal`} />
          <StatRow label="総挙上ボリューム" value={`${totalVolume.toLocaleString()} kg`} />
        </div>
      </div>

      {/* アプリ情報 */}
      <div className="card text-center text-gray-400 text-xs space-y-1">
        <p className="text-2xl pb-1">🏋️</p>
        <p className="font-semibold text-gray-600">Mascle v1.0</p>
        <p>筋トレ記録 & カロリー計算アプリ</p>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-center">
      <p className="text-lg font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
