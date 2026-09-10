import { describe, expect, it } from 'vitest';
import { runAudit } from '../../src/lib/audit/engine';
import { makeContext } from '../helpers/snapshot';

describe('language rules', () => {
  it('flags a missing lang attribute', () => {
    const report = runAudit(makeContext({ htmlLang: '' }));
    const finding = report.findings.find((item) => item.ruleId === 'html-lang-missing' && !item.passed);
    expect(finding?.severity).toBe('error');
  });

  it('flags an invalid language tag', () => {
    const report = runAudit(makeContext({ htmlLang: 'en_US' }));
    const finding = report.findings.find((item) => item.ruleId === 'html-lang-invalid' && !item.passed);
    expect(finding?.severity).toBe('error');
  });

  it('warns when Arabic is missing dir=rtl', () => {
    const report = runAudit(makeContext({ htmlLang: 'ar', dir: '' }));
    const finding = report.findings.find((item) => item.ruleId === 'rtl-dir-mismatch' && !item.passed);
    expect(finding?.severity).toBe('warning');
  });

  it('passes a valid French document', () => {
    const report = runAudit(makeContext({ htmlLang: 'fr', dir: 'ltr' }));
    expect(report.findings.some((item) => item.ruleId === 'html-lang-missing' && item.passed)).toBe(
      true,
    );
    expect(report.findings.some((item) => item.ruleId === 'rtl-dir-mismatch' && !item.passed)).toBe(
      false,
    );
  });
});
