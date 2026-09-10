import { languageLooksMismatched } from '../../locale/detect';
import { makeFinding, pass } from '../../audit/finding';
import type { AuditRule } from '../../types';

export const imgAltMissing: AuditRule = {
  id: 'img-alt-missing',
  title: 'Image alt text',
  category: 'content',
  defaultSeverity: 'warning',
  run(context) {
    const missing = context.snapshot.images.filter((img) => img.alt === null);
    if (!missing.length) {
      return [pass(imgAltMissing, 'All sampled images declare an alt attribute.')];
    }
    return missing.slice(0, 25).map((img) =>
      makeFinding(imgAltMissing, {
        passed: false,
        message: 'Image is missing an alt attribute.',
        evidence: { expected: 'alt="…"', found: 'no alt attribute', source: img.raw },
        selector: img.selector,
        url: img.src,
        idSuffix: img.selector,
      }),
    );
  },
};

export const possibleLanguageMismatch: AuditRule = {
  id: 'possible-language-mismatch',
  title: 'Content language mismatch',
  category: 'content',
  defaultSeverity: 'review',
  run(context) {
    if (!context.settings.detectContentLanguage) {
      return [pass(possibleLanguageMismatch, 'Content language detection is disabled.')];
    }

    const findings = [];
    const bodyMismatch = languageLooksMismatched(
      context.snapshot.sampledText,
      context.snapshot.htmlLang,
    );
    if (bodyMismatch) {
      findings.push(
        makeFinding(possibleLanguageMismatch, {
          passed: false,
          message:
            'Visible page text appears to match another language — review whether this is intended.',
          evidence: {
            expected: bodyMismatch.declaredLanguage,
            found: `${bodyMismatch.detection.language} (confidence ${bodyMismatch.detection.accuracy.toFixed(2)})`,
            source: context.snapshot.sampledText.slice(0, 240),
          },
          idSuffix: 'body',
        }),
      );
    }

    for (const img of context.snapshot.images) {
      if (!img.alt || img.alt.length < 24) continue;
      const mismatch = languageLooksMismatched(img.alt, context.snapshot.htmlLang);
      if (!mismatch) continue;
      findings.push(
        makeFinding(possibleLanguageMismatch, {
          passed: false,
          message:
            'Image alt text appears to match another language — review whether this is intended.',
          evidence: {
            expected: mismatch.declaredLanguage,
            found: `${mismatch.detection.language} (confidence ${mismatch.detection.accuracy.toFixed(2)})`,
            source: img.alt,
          },
          selector: img.selector,
          url: img.src,
          idSuffix: img.selector,
        }),
      );
    }

    if (!findings.length) {
      return [pass(possibleLanguageMismatch, 'Sampled content appears consistent with the document language.')];
    }
    return findings;
  },
};
