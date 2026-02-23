// ========================================
// Frontend: API Client
// ========================================
import type {
  Exercise,
  WorkoutSession,
  CreateWorkoutSessionInput,
  AddWorkoutSetInput,
  ApiResponse,
  MuscleGroup,
} from '../types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

const TOKEN_KEY = 'mascle_auth_token';

function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${url}`, {
    headers,
    ...options,
  });

  if (res.status === 401) {
    // トークン期限切れ等 → localStorage をクリアしてページリロード
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('mascle_auth_user');
    window.location.reload();
    return undefined as T;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

// ---- Auth Types ----
export interface AuthResponse {
  token: string;
  user: { id: string; email: string; displayName: string };
}

// ---- Auth API ----
export const authApi = {
  register: (email: string, password: string, displayName: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () =>
    request<{ id: string; email: string; displayName: string }>('/auth/me'),
};

// ---- Exercise API ----
export const exerciseApi = {
  getAll: (muscleGroup?: MuscleGroup) => {
    const query = muscleGroup ? `?muscleGroup=${muscleGroup}` : '';
    return request<Exercise[]>(`/exercises${query}`);
  },
};

// ---- Workout Session API ----
export const sessionApi = {
  getAll: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString() ? `?${params}` : '';
    return request<WorkoutSession[]>(`/sessions${query}`);
  },

  getById: (id: string) =>
    request<WorkoutSession>(`/sessions/${id}`),

  create: (input: CreateWorkoutSessionInput) =>
    request<WorkoutSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  addSet: (sessionId: string, input: AddWorkoutSetInput) =>
    request<WorkoutSession>(`/sessions/${sessionId}/sets`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  deleteSet: (sessionId: string, setId: string) =>
    request<WorkoutSession>(`/sessions/${sessionId}/sets/${setId}`, {
      method: 'DELETE',
    }),

  delete: (id: string) =>
    request<void>(`/sessions/${id}`, { method: 'DELETE' }),
};

