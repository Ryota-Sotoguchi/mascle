// ========================================
// Hook: useWorkoutSessions
// ゲストモード（インメモリ）+ ログインモード（API）切り替え
// ========================================
import { useState, useEffect, useCallback, useRef } from 'react';
import type { WorkoutSession, CreateWorkoutSessionInput, AddWorkoutSetInput } from '../types';
import { sessionApi, exerciseApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

// ゲスト用ローカル集計計算
function calcTotals(session: WorkoutSession): WorkoutSession {
  const totalCaloriesBurned = Math.round(session.sets.reduce((s, x) => s + x.caloriesBurned, 0) * 10) / 10;
  const totalSets = session.sets.length;
  const totalVolume = session.sets.reduce((s, x) => s + x.reps * x.weightKg, 0);
  const totalDurationMinutes = Math.round(session.sets.reduce((s, x) => s + x.durationMinutes, 0) * 10) / 10;
  return { ...session, totalCaloriesBurned, totalSets, totalVolume, totalDurationMinutes };
}

// MET ベース or ACSM 公式 × 体重 × 時間(h) × 1.05 × 負荷係数
function calcCalories(
  met: number,
  bodyWeightKg: number,
  durationMinutes: number,
  weightKg = 0,
  inclinePct = 0,
  speedKmh = 0,
): number {
  let adjustedMet: number;
  if (speedKmh > 0) {
    // ACSM metabolic formula (ランニング/ウォーキング)
    const speedMpm = speedKmh * (1000 / 60);
    const grade = inclinePct / 100;
    const isRunning = speedKmh >= 8;
    const hCoeff = isRunning ? 0.2 : 0.1;
    const vCoeff = isRunning ? 0.9 : 1.8;
    const vo2 = speedMpm * hCoeff + speedMpm * grade * vCoeff + 3.5;
    adjustedMet = vo2 / 3.5;
  } else {
    adjustedMet = met + inclinePct * 0.5;
  }
  const loadFactor = weightKg > 0 && bodyWeightKg > 0
    ? 1 + Math.min(weightKg / bodyWeightKg, 1.0) * 0.5
    : 1;
  return Math.round(adjustedMet * loadFactor * bodyWeightKg * (durationMinutes / 60) * 1.05 * 10) / 10;
}

export function useWorkoutSessions() {
  const { token } = useAuth();
  const isGuest = !token;

  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(!isGuest);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const guestSessionsRef = useRef<WorkoutSession[]>([]);
  // エクササイズの MET / 入力タイプ キャッシュ（認証不要）
  const exerciseMetRef = useRef<Map<string, { met: number; name: string; nameJa: string; inputType: string }>>(new Map());

  // エクササイズ情報を起動時に取得（認証不要）
  useEffect(() => {
    exerciseApi.getAll().then(list => {
      const map = new Map<string, { met: number; name: string; nameJa: string; inputType: string }>();
      for (const ex of list) map.set(ex.id, { met: ex.met, name: ex.name, nameJa: ex.nameJa, inputType: ex.inputType });
      exerciseMetRef.current = map;
    }).catch(() => { /* サイレント失敗 */ });
  }, []);

  // =========================================
  // API モード（ログイン済み）のフェッチ
  // =========================================
  const fetchSessions = useCallback(async (from?: string, to?: string) => {
    if (isGuest) return;
    try {
      setLoading(true);
      setError(null);
      const data = await sessionApi.getAll(from, to);
      setSessions(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  const applyDateFilter = useCallback((from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    if (isGuest) {
      const all = guestSessionsRef.current;
      if (!from && !to) { setSessions(all); return; }
      setSessions(all.filter(s => {
        if (from && s.date < from) return false;
        if (to && s.date > to) return false;
        return true;
      }));
    } else {
      fetchSessions(from || undefined, to || undefined);
    }
  }, [isGuest, fetchSessions]);

  const createSession = useCallback(async (input: CreateWorkoutSessionInput) => {
    try {
      setError(null);
      if (isGuest) {
        const now = new Date().toISOString();
        const session: WorkoutSession = {
          id: crypto.randomUUID(),
          date: input.date,
          bodyWeightKg: input.bodyWeightKg,
          note: input.note,
          sets: [],
          totalCaloriesBurned: 0,
          totalSets: 0,
          totalVolume: 0,
          totalDurationMinutes: 0,
          createdAt: now,
          updatedAt: now,
        };
        guestSessionsRef.current = [session, ...guestSessionsRef.current];
        setSessions([...guestSessionsRef.current]);
        setCurrentSession(session);
        return session;
      }
      const session = await sessionApi.create(input);
      setCurrentSession(session);
      setSessions(prev => [session, ...prev]);
      return session;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, [isGuest]);

  const addSet = useCallback(async (sessionId: string, input: AddWorkoutSetInput) => {
    try {
      setError(null);
      if (isGuest) {
        const ex = exerciseMetRef.current.get(input.exerciseId);
        const targetSession = guestSessionsRef.current.find(s => s.id === sessionId);
        const bodyWeightKg = targetSession?.bodyWeightKg ?? 60;
        const isCardio = ex?.inputType === 'cardio';
        const isDurationBased = isCardio || ex?.inputType === 'duration';
        const duration = input.durationMinutes
          ?? (isDurationBased ? 1 : Math.round((input.reps * 4 + 60) / 60 * 100) / 100);
        const inclinePct = isCardio ? input.weightKg : 0;
        const weightForCalc = isCardio ? 0 : input.weightKg;
        const speedKmh = isCardio ? (input.speedKmh ?? 0) : 0;
        const calories = ex ? calcCalories(ex.met, bodyWeightKg, duration, weightForCalc, inclinePct, speedKmh) : 0;

        const newSet = {
          id: crypto.randomUUID(),
          exerciseId: input.exerciseId,
          exerciseName: ex?.name,
          exerciseNameJa: ex?.nameJa,
          setNumber: 0,
          reps: input.reps,
          weightKg: input.weightKg,
          durationMinutes: duration,
          caloriesBurned: calories,
          speedKmh: input.speedKmh ?? 0,
        };
        const updated = guestSessionsRef.current.map(s => {
          if (s.id !== sessionId) return s;
          const sets = [...s.sets, { ...newSet, setNumber: s.sets.length + 1 }];
          return calcTotals({ ...s, sets, updatedAt: new Date().toISOString() });
        });
        guestSessionsRef.current = updated;
        setSessions([...updated]);
        const cur = updated.find(s => s.id === sessionId) ?? null;
        setCurrentSession(cur);
        return cur;
      }
      const updated = await sessionApi.addSet(sessionId, input);
      setCurrentSession(updated);
      setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, [isGuest]);

  const removeSet = useCallback(async (sessionId: string, setId: string) => {
    try {
      setError(null);
      if (isGuest) {
        const updated = guestSessionsRef.current.map(s => {
          if (s.id !== sessionId) return s;
          const sets = s.sets
            .filter(x => x.id !== setId)
            .map((x, i) => ({ ...x, setNumber: i + 1 }));
          return calcTotals({ ...s, sets, updatedAt: new Date().toISOString() });
        });
        guestSessionsRef.current = updated;
        setSessions([...updated]);
        const cur = updated.find(s => s.id === sessionId) ?? null;
        setCurrentSession(cur);
        return cur;
      }
      const updated = await sessionApi.deleteSet(sessionId, setId);
      setCurrentSession(updated);
      setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, [isGuest]);

  const deleteSession = useCallback(async (id: string) => {
    try {
      setError(null);
      if (isGuest) {
        guestSessionsRef.current = guestSessionsRef.current.filter(s => s.id !== id);
        setSessions([...guestSessionsRef.current]);
        if (currentSession?.id === id) setCurrentSession(null);
        return;
      }
      await sessionApi.delete(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSession?.id === id) setCurrentSession(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [isGuest, currentSession]);

  const selectSession = useCallback(async (id: string) => {
    try {
      setError(null);
      if (isGuest) {
        const s = guestSessionsRef.current.find(s => s.id === id) ?? null;
        setCurrentSession(s);
        return;
      }
      const session = await sessionApi.getById(id);
      setCurrentSession(session);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [isGuest]);

  useEffect(() => {
    if (!isGuest) {
      fetchSessions();
    }
  }, [isGuest, fetchSessions]);

  return {
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
    refetch: fetchSessions,
  };
}

