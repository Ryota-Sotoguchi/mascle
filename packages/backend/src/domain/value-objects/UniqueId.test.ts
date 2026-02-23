// ========================================
// Unit Test: UniqueId Value Object
// ========================================
import { describe, it, expect } from 'vitest';
import { UniqueId } from './UniqueId.js';

describe('UniqueId', () => {
  describe('create', () => {
    it('UUID v4形式のIDを生成する', () => {
      const id = UniqueId.create();
      expect(id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('毎回異なるIDが生成される', () => {
      const id1 = UniqueId.create();
      const id2 = UniqueId.create();
      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe('from', () => {
    it('指定した文字列からIDを生成する', () => {
      const id = UniqueId.from('test-id-123');
      expect(id.value).toBe('test-id-123');
    });

    it('空文字列はエラーになる', () => {
      expect(() => UniqueId.from('')).toThrow('ID cannot be empty');
    });

    it('空白のみの文字列はエラーになる', () => {
      expect(() => UniqueId.from('   ')).toThrow('ID cannot be empty');
    });
  });

  describe('equals', () => {
    it('同じ値のIDは等しい', () => {
      const id1 = UniqueId.from('same-id');
      const id2 = UniqueId.from('same-id');
      expect(id1.equals(id2)).toBe(true);
    });

    it('異なる値のIDは等しくない', () => {
      const id1 = UniqueId.from('id-1');
      const id2 = UniqueId.from('id-2');
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('IDの文字列表現を返す', () => {
      const id = UniqueId.from('my-id');
      expect(id.toString()).toBe('my-id');
    });
  });
});
