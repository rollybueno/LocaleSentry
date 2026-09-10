import { describe, expect, it } from 'vitest';
import { runAudit } from '../../src/lib/audit/engine';
import { makeContext } from '../helpers/snapshot';

describe('metadata rules', () => {
  it('flags a missing title', () => {
    const report = runAudit(makeContext({ title: '', titleAndMetaText: '' }));
    expect(report.findings.some((item) => item.ruleId === 'meta-title-missing' && !item.passed)).toBe(
      true,
    );
  });

  it('flags og:locale that does not match html lang', () => {
    const report = runAudit(
      makeContext({
        htmlLang: 'fr',
        meta: {
          description: 'Bonjour',
          ogTitle: 'Produit',
          ogDescription: 'Bonjour',
          ogLocale: 'en_US',
          ogLocaleAlternates: [],
          twitterTitle: null,
          twitterDescription: null,
        },
      }),
    );
    const finding = report.findings.find((item) => item.ruleId === 'og-locale-mismatch' && !item.passed);
    expect(finding?.severity).toBe('warning');
  });
});
