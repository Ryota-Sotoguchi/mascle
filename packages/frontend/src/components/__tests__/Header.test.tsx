// ========================================
// Unit Test: Header
// ========================================
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../Header';

describe('Header', () => {
  it('デフォルトで "Mascle" を表示する', () => {
    render(<Header onMenuOpen={vi.fn()} />);
    expect(screen.getByText('Mascle')).toBeInTheDocument();
  });

  it('title プロップが渡された場合それを表示する', () => {
    render(<Header onMenuOpen={vi.fn()} title="ホーム" />);
    expect(screen.getByText('ホーム')).toBeInTheDocument();
  });

  it('ハンバーガーボタンが存在する', () => {
    render(<Header onMenuOpen={vi.fn()} />);
    expect(screen.getByLabelText('メニューを開く')).toBeInTheDocument();
  });

  it('ハンバーガーボタンクリックで onMenuOpen が呼ばれる', async () => {
    const onMenuOpen = vi.fn();
    render(<Header onMenuOpen={onMenuOpen} />);
    await userEvent.click(screen.getByLabelText('メニューを開く'));
    expect(onMenuOpen).toHaveBeenCalledTimes(1);
  });
});

