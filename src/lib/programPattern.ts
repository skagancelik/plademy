/**
 * Deterministic program background pattern picker.
 * Same slug always gets the same pattern (SSR-safe, cache-friendly).
 */

export const PROGRAM_PATTERN_COUNT = 10;

export type ProgramPatternId = number;

export function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getProgramPatternId(seed: string): ProgramPatternId {
  return hashSeed(seed || 'plademy') % PROGRAM_PATTERN_COUNT;
}

export function getProgramPatternClass(seed: string): string {
  return `program-pattern program-pattern--${getProgramPatternId(seed)}`;
}
