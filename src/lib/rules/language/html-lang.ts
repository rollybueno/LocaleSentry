import { isValidLanguageTag } from '../../locale/bcp47';
import { makeFinding, pass } from '../../audit/finding';
import type { AuditRule } from '../../types';

export const htmlLangMissing: AuditRule = {
  id: 'html-lang-missing',
  title: 'Document language',
  category: 'language',
  defaultSeverity: 'error',
  run(context) {
    const lang = context.snapshot.htmlLang;
    if (!lang) {
      return [
        makeFinding(htmlLangMissing, {
          passed: false,
          message: 'The document does not declare a language.',
          evidence: {
            expected: '<html lang="…">',
            found: '<html> without lang',
            source: '<html>',
          },
          selector: 'html',
        }),
      ];
    }
    return [pass(htmlLangMissing, `Document language is ${lang}.`)];
  },
};

export const htmlLangInvalid: AuditRule = {
  id: 'html-lang-invalid',
  title: 'Language tag validity',
  category: 'language',
  defaultSeverity: 'error',
  run(context) {
    const lang = context.snapshot.htmlLang;
    if (!lang) {
      return [pass(htmlLangInvalid, 'No language tag to validate.')];
    }
    if (!isValidLanguageTag(lang)) {
      return [
        makeFinding(htmlLangInvalid, {
          passed: false,
          message: `“${lang}” is not a valid BCP 47 language tag.`,
          evidence: {
            expected: 'BCP 47 tag such as fr or fr-FR',
            found: lang,
            source: `<html lang="${lang}">`,
          },
          selector: 'html',
        }),
      ];
    }
    return [pass(htmlLangInvalid, `Language tag ${lang} is valid.`)];
  },
};
