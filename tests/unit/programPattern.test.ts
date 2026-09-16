import { describe, it, expect } from 'vitest';
import {
  getProgramPatternId,
  getProgramPatternClass,
  PROGRAM_PATTERN_COUNT,
} from '../../src/lib/programPattern';

describe('programPattern', () => {
  it('returns a stable pattern id for the same seed', () => {
    const seed = 'erg-referral-acceleration-diverse-talent-pipeline';
    expect(getProgramPatternId(seed)).toBe(getProgramPatternId(seed));
  });

  it('returns different patterns for different seeds', () => {
    expect(getProgramPatternId('program-a')).not.toBe(getProgramPatternId('program-b-longer'));
  });

  it('stays within pattern count bounds', () => {
    const id = getProgramPatternId('any-program-slug');
    expect(id).toBeGreaterThanOrEqual(0);
    expect(id).toBeLessThan(PROGRAM_PATTERN_COUNT);
  });

  it('builds the expected CSS class', () => {
    expect(getProgramPatternClass('erg-referral-acceleration-diverse-talent-pipeline')).toBe(
      'program-pattern program-pattern--8'
    );
  });
});
