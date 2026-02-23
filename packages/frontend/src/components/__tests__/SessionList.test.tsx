// ========================================
// Unit Test: SessionList
// ========================================
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SessionList } from '../SessionList';
import type { WorkoutSession } from '../../types';

function createSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'session-1',
    date: '2026-02-10',
    bodyWeightKg: 70,
    sets: [],
    totalCaloriesBurned: 200,
    totalSets: 3,
    totalVolume: 1500,
    totalDurationMinutes: 30,
    createdAt: '2026-02-10T10:00:00.000Z',
    updatedAt: '2026-02-10T10:00:00.000Z',
    ...overrides,
  };
}

describe('SessionList', () => {
  it('ローディング中はスピナーメッセージを表示する', () => {
    render(
      <SessionList sessions={[]} loading={true} onSelect={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByText('読込中...')).toBeInTheDocument();
  });

  it('セッションが空のとき空状態メッセージを表示する', () => {
    render(
      <SessionList sessions={[]} loading={false} onSelect={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByText('まだワークアウトの記録がありません')).toBeInTheDocument();
  });

  it('セッション一覧を表示する', () => {
    const sessions = [
      createSession({ id: 's1', date: '2026-02-10', totalCaloriesBurned: 200 }),
      createSession({ id: 's2', date: '2026-02-13', totalCaloriesBurned: 350 }),
    ];
    render(
      <SessionList sessions={sessions} loading={false} onSelect={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByText('📅 ワークアウト履歴')).toBeInTheDocument();
    expect(screen.getAllByText(/kcal/)).toHaveLength(2);
  });

  it('セッションをクリックすると onSelect が呼ばれる', () => {
    const onSelect = vi.fn();
    const sessions = [createSession({ id: 'session-abc', date: '2026-02-10' })];
    render(
      <SessionList sessions={sessions} loading={false} onSelect={onSelect} onDelete={vi.fn()} />
    );
    // カード全体 (cursor-pointer なdiv) をクリック
    const card = screen.getByText(/200 kcal/).closest('div[class*="card"]')!;
    fireEvent.click(card);
    expect(onSelect).toHaveBeenCalledWith('session-abc');
  });

  it('削除ボタンをクリックすると onDelete が呼ばれる', () => {
    const onDelete = vi.fn();
    const sessions = [createSession({ id: 'session-del' })];
    render(
      <SessionList sessions={sessions} loading={false} onSelect={vi.fn()} onDelete={onDelete} />
    );
    fireEvent.click(screen.getByTitle('削除'));
    expect(onDelete).toHaveBeenCalledWith('session-del');
  });

  it('ノートがある場合は表示する', () => {
    const sessions = [createSession({ note: '脚トレ日' })];
    render(
      <SessionList sessions={sessions} loading={false} onSelect={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByText('脚トレ日')).toBeInTheDocument();
  });
});
