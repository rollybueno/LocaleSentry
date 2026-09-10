import { languageLooksMismatched } from '../../locale/detect';
import { tagsMatch } from '../../locale/bcp47';
import { makeFinding, pass } from '../../audit/finding';
import type { AuditRule } from '../../types';

export const metaTitleMissing: AuditRule = {
  id: 'meta-title-missing',
  title: 'Document title',
  category: 'metadata',
  defaultSeverity: 'error',
  run(context) {
    if (!context.snapshot.title) {
      return [
        makeFinding(metaTitleMissing, {
          passed: false,
          message: 'The page has no title.',
          evidence: { expected: '<title>…</title>', found: 'empty' },
          selector: 'title',
        }),
      ];
    }
    return [pass(metaTitleMissing, `Title is “${context.snapshot.title}”.`)];
  },
};

export const ogLocaleMismatch: AuditRule = {
  id: 'og-locale-mismatch',
  title: 'Open Graph locale',
  category: 'metadata',
  defaultSeverity: 'warning',
  run(context) {
    const og = context.snapshot.meta.ogLocale;
    const htmlLang = context.snapshot.htmlLang;
    if (!og) {
      return [
        makeFinding(ogLocaleMismatch, {
          passed: false,
          severity: htmlLang ? 'warning' : 'info',
          message: 'og:locale is not declared.',
          evidence: { expected: 'og:locale matching the document language', found: 'missing' },
        }),
      ];
    }
    if (htmlLang && !tagsMatch(og, htmlLang)) {
      return [
        makeFinding(ogLocaleMismatch, {
          passed: false,
          message: `og:locale (${og}) does not match the document language (${htmlLang}).`,
          evidence: {
            expected: htmlLang,
            found: og,
            source: `<meta property="og:locale" content="${og}">`,
          },
        }),
      ];
    }
    return [pass(ogLocaleMismatch, `og:locale ${og} matches the document language.`)];
  },
};

export const metaLanguageMismatch: AuditRule = {
  id: 'meta-language-mismatch',
  title: 'Metadata language',
  category: 'metadata',
  defaultSeverity: 'review',
  run(context) {
    if (!context.settings.detectContentLanguage) {
      return [pass(metaLanguageMismatch, 'Content language detection is disabled.')];
    }
    const htmlLang = context.snapshot.htmlLang;
    const mismatch = languageLooksMismatched(context.snapshot.titleAndMetaText, htmlLang);
    if (!mismatch) {
      return [pass(metaLanguageMismatch, 'Metadata language appears consistent with the document language.')];
    }
    return [
      makeFinding(metaLanguageMismatch, {
        passed: false,
        message:
          'Title or social metadata appears to match another language — review whether this is intended.',
        evidence: {
          expected: mismatch.declaredLanguage,
          found: `${mismatch.detection.language} (confidence ${mismatch.detection.accuracy.toFixed(2)})`,
          source: context.snapshot.titleAndMetaText.slice(0, 240),
        },
      }),
    ];
  },
};
