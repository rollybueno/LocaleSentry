import { describe, expect, it } from 'vitest';
import { runAudit } from '../../src/lib/audit/engine';
import { makeContext } from '../helpers/snapshot';

describe('canonical rules', () => {
  it('treats missing canonical as info on a monolingual page', () => {
    const report = runAudit(makeContext({ canonical: null, canonicalRaw: null, hreflang: [] }));
    const finding = report.findings.find((item) => item.ruleId === 'canonical-missing' && !item.passed);
    expect(finding?.severity).toBe('info');
  });

  it('warns when a multilingual page has no canonical', () => {
    const report = runAudit(makeContext({ canonical: null, canonicalRaw: null }));
    const finding = report.findings.find((item) => item.ruleId === 'canonical-missing' && !item.passed);
    expect(finding?.severity).toBe('warning');
  });

  it('flags a French page that canonicalizes to English', () => {
    const report = runAudit(
      makeContext({
        canonical: 'https://example.com/product',
        canonicalRaw: '<link rel="canonical" href="https://example.com/product">',
      }),
    );
    expect(
      report.findings.some((item) => item.ruleId === 'canonical-locale-conflict' && !item.passed),
    ).toBe(true);
  });
});
