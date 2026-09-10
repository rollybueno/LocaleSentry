/** @vitest-environment jsdom */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runAudit } from '../../src/lib/audit/engine';
import { collectPageSnapshot } from '../../src/lib/scanner/collect';
import { DEFAULT_SETTINGS } from '../../src/lib/types';

const fixtures = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

function auditFixture(name: string, url: string) {
  const html = readFileSync(join(fixtures, name), 'utf8');
  document.open();
  document.write(html);
  document.close();
  const snapshot = collectPageSnapshot(document, url);
  return runAudit({
    snapshot,
    settings: { ...DEFAULT_SETTINGS, detectContentLanguage: false },
    http: { enabled: false, permissionGranted: false, checks: [] },
  });
}

describe('HTML fixtures', () => {
  it('scores a healthy English page without errors', () => {
    const report = auditFixture('healthy-en.html', 'https://127.0.0.1:4177/');
    expect(report.findings.some((item) => item.severity === 'error' && !item.passed)).toBe(false);
    expect(report.score).toBeGreaterThanOrEqual(80);
  });

  it('flags a French page that canonicalizes to English', () => {
    const report = auditFixture(
      'fr-canonical-conflict.html',
      'https://example.com/fr/product',
    );
    expect(
      report.findings.some((item) => item.ruleId === 'canonical-locale-conflict' && !item.passed),
    ).toBe(true);
  });
});
