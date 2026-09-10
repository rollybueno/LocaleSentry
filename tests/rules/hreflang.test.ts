import { describe, expect, it } from 'vitest';
import { runAudit } from '../../src/lib/audit/engine';
import { makeContext, makeSnapshot } from '../helpers/snapshot';

describe('hreflang rules', () => {
  it('warns when no hreflang links exist', () => {
    const report = runAudit(makeContext({ hreflang: [] }));
    const finding = report.findings.find((item) => item.ruleId === 'hreflang-missing' && !item.passed);
    expect(finding?.severity).toBe('warning');
  });

  it('flags invalid hreflang codes', () => {
    const snapshot = makeSnapshot({
      hreflang: [
        {
          hreflang: 'french',
          href: 'https://example.com/fr/product',
          source: 'link-tag',
          raw: '<link rel="alternate" hreflang="french" href="https://example.com/fr/product">',
        },
      ],
    });
    const report = runAudit(makeContext(snapshot));
    expect(report.findings.some((item) => item.ruleId === 'hreflang-invalid' && !item.passed)).toBe(
      true,
    );
  });

  it('flags duplicate locales', () => {
    const report = runAudit(
      makeContext({
        hreflang: [
          {
            hreflang: 'fr',
            href: 'https://example.com/fr/product',
            source: 'link-tag',
            raw: 'a',
          },
          {
            hreflang: 'fr',
            href: 'https://example.com/fr/other',
            source: 'link-tag',
            raw: 'b',
          },
        ],
      }),
    );
    expect(
      report.findings.some((item) => item.ruleId === 'hreflang-duplicate-locale' && !item.passed),
    ).toBe(true);
  });

  it('allows x-default to share a URL with English', () => {
    const report = runAudit(makeContext());
    expect(
      report.findings.some((item) => item.ruleId === 'hreflang-duplicate-url' && !item.passed),
    ).toBe(false);
  });

  it('flags a missing self-reference', () => {
    const report = runAudit(
      makeContext({
        url: 'https://example.com/es/product',
      }),
    );
    expect(
      report.findings.some((item) => item.ruleId === 'hreflang-missing-self' && !item.passed),
    ).toBe(true);
  });

  it('warns when x-default is missing', () => {
    const snapshot = makeSnapshot();
    snapshot.hreflang = snapshot.hreflang.filter((item) => item.hreflang !== 'x-default');
    const report = runAudit(makeContext(snapshot));
    expect(
      report.findings.some((item) => item.ruleId === 'hreflang-missing-x-default' && !item.passed),
    ).toBe(true);
  });

  it('emits info when remote checks are disabled', () => {
    const report = runAudit(makeContext());
    const finding = report.findings.find((item) => item.ruleId === 'hreflang-http-error');
    expect(finding?.severity).toBe('info');
  });

  it('flags a 404 alternate when remote checks are on', () => {
    const report = runAudit(
      makeContext(
        {},
        {},
        {
          enabled: true,
          permissionGranted: true,
          checks: [
            {
              url: 'https://example.com/de/product',
              ok: false,
              status: 404,
              redirected: false,
              finalUrl: 'https://example.com/de/product',
            },
          ],
        },
      ),
    );
    const finding = report.findings.find(
      (item) => item.ruleId === 'hreflang-http-error' && item.severity === 'error',
    );
    expect(finding?.url).toBe('https://example.com/de/product');
  });
});
