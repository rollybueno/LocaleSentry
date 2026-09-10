import { describe, expect, it } from 'vitest';
import { runAudit } from '../../src/lib/audit/engine';
import { reportToCsv, reportToMarkdown } from '../../src/lib/reporters';
import { makeContext } from '../helpers/snapshot';

describe('reporters', () => {
  it('includes score and rule ids in markdown', () => {
    const report = runAudit(makeContext({ htmlLang: '' }));
    const markdown = reportToMarkdown(report);
    expect(markdown).toContain('# LocaleSentry Report');
    expect(markdown).toContain('html-lang-missing');
    expect(markdown).toMatch(/Score: \d+\/100/);
  });

  it('writes a csv header and rows', () => {
    const report = runAudit(makeContext({ htmlLang: '' }));
    const csv = reportToCsv(report);
    expect(csv.startsWith('ruleId,severity,passed,message,url,selector,locale')).toBe(true);
    expect(csv).toContain('html-lang-missing');
  });
});
