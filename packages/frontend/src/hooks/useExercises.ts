// ========================================
// Hook: useExercises
// ========================================
import { useState, useEffect, useCallback } from 'react';
import type { Exercise, MuscleGroup } from '../types';
import { exerciseApi } from '../api/client';

export function useExercises(muscleGroup?: MuscleGroup) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exerciseApi.getAll(muscleGroup);
      setExercises(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [muscleGroup]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { exercises, loading, error, refetch: fetch };
}
