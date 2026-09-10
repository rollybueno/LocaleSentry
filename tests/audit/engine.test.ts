import { describe, expect, it } from 'vitest';
import { runAudit } from '../../src/lib/audit/engine';
import { computeScore } from '../../src/lib/audit/score';
import { makeContext } from '../helpers/snapshot';

describe('scoring', () => {
  it('starts at 100 and never goes below 0', () => {
    expect(computeScore([])).toBe(100);
    expect(
      computeScore(
        Array.from({ length: 40 }, (_, index) => ({
          id: String(index),
          ruleId: 'html-lang-missing',
          title: 'x',
          category: 'language' as const,
          severity: 'error' as const,
          passed: false,
          message: 'x',
        })),
      ),
    ).toBe(0);
  });

  it('explains deductions through findings on the report', () => {
    const report = runAudit(makeContext({ htmlLang: '', title: '' }));
    expect(report.score).toBeLessThan(100);
    expect(report.counts.error).toBeGreaterThan(0);
  });
});
