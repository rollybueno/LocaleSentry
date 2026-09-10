import { describe, expect, it } from 'vitest';
import { runAudit } from '../../src/lib/audit/engine';
import { makeContext } from '../helpers/snapshot';

describe('content rules', () => {
  it('flags images without an alt attribute', () => {
    const report = runAudit(
      makeContext({
        images: [
          {
            src: 'https://cdn.example.com/hero.jpg',
            alt: null,
            selector: 'img.hero',
            raw: '<img src="https://cdn.example.com/hero.jpg">',
          },
        ],
      }),
    );
    const finding = report.findings.find((item) => item.ruleId === 'img-alt-missing' && !item.passed);
    expect(finding?.selector).toBe('img.hero');
  });

  it('does not treat empty alt as missing', () => {
    const report = runAudit(
      makeContext({
        images: [
          {
            src: 'https://cdn.example.com/pattern.jpg',
            alt: '',
            selector: 'img.deco',
            raw: '<img src="https://cdn.example.com/pattern.jpg" alt="">',
          },
        ],
      }),
    );
    expect(report.findings.some((item) => item.ruleId === 'img-alt-missing' && !item.passed)).toBe(
      false,
    );
  });

  it('reviews English alt text on a French page when detection is on', () => {
    const report = runAudit(
      makeContext(
        {
          htmlLang: 'fr',
          images: [
            {
              src: 'https://cdn.example.com/checkout.jpg',
              alt: 'Click here to complete your purchase and continue to checkout today',
              selector: 'img.cta',
              raw: '<img src="https://cdn.example.com/checkout.jpg" alt="Click here to complete your purchase and continue to checkout today">',
            },
          ],
        },
        { detectContentLanguage: true },
      ),
    );
    const finding = report.findings.find(
      (item) => item.ruleId === 'possible-language-mismatch' && item.selector === 'img.cta',
    );
    expect(finding?.severity).toBe('review');
    expect(finding?.message.includes('untranslated')).toBe(false);
  });
});
