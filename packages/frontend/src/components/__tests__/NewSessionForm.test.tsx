// ========================================
// Unit Test: NewSessionForm
// ========================================
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NewSessionForm } from '../NewSessionForm';

describe('NewSessionForm', () => {
  it('フォームの必須フィールドが表示される', () => {
    render(<NewSessionForm onSubmit={vi.fn()} />);
    expect(screen.getByText('日付')).toBeInTheDocument();
    expect(screen.getByText('体重 (kg)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'セッション開始' })).toBeInTheDocument();
  });

  it('体重が未入力の場合は onSubmit が呼ばれない', async () => {
    const onSubmit = vi.fn();
    render(<NewSessionForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'セッション開始' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('正しい値を入力してサブミットすると onSubmit が呼ばれる', async () => {
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(<NewSessionForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('70.0'), { target: { value: '70' } });
    fireEvent.click(screen.getByRole('button', { name: 'セッション開始' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ bodyWeightKg: 70 })
      );
    });
  });

  it('ノートを入力できる', () => {
    render(<NewSessionForm onSubmit={vi.fn()} />);
    const noteInput = screen.getByPlaceholderText('例: 胸の日、調子良い');
    fireEvent.change(noteInput, { target: { value: '胸トレ' } });
    expect(noteInput).toHaveValue('胸トレ');
  });
});
