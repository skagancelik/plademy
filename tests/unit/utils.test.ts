import { describe, it, expect } from 'vitest';
import { slugify, truncate, formatDate } from '../../src/lib/utils';

describe('utils', () => {
  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test 123!')).toBe('test-123');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const longText = 'a'.repeat(200);
      expect(truncate(longText, 100).length).toBeLessThanOrEqual(103); // 100 + '...'
    });

    it('should not truncate short text', () => {
      expect(truncate('Short text', 100)).toBe('Short text');
    });
  });

  describe('formatDate', () => {
    it('should format date', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date, 'en')).toContain('2024');
    });
  });
});

