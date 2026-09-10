import { isValidLanguageTag } from '../../locale/bcp47';
import { isRtlLanguage } from '../../locale/rtl';
import { makeFinding, pass } from '../../audit/finding';
import type { AuditRule } from '../../types';

export const rtlDirMismatch: AuditRule = {
  id: 'rtl-dir-mismatch',
  title: 'Text direction',
  category: 'language',
  defaultSeverity: 'warning',
  run(context) {
    const { htmlLang, dir } = context.snapshot;
    if (!htmlLang || !isValidLanguageTag(htmlLang)) {
      return [pass(rtlDirMismatch, 'Direction check skipped without a valid language tag.')];
    }

    const rtl = isRtlLanguage(htmlLang);
    if (rtl && dir !== 'rtl') {
      return [
        makeFinding(rtlDirMismatch, {
          passed: false,
          message: `The document language looks RTL (${htmlLang}) but dir is not “rtl”.`,
          evidence: {
            expected: 'dir="rtl"',
            found: dir ? `dir="${dir}"` : 'no dir attribute',
            source: `<html lang="${htmlLang}"${dir ? ` dir="${dir}"` : ''}>`,
          },
          selector: 'html',
        }),
      ];
    }

    if (!rtl && dir === 'rtl') {
      return [
        makeFinding(rtlDirMismatch, {
          passed: false,
          message: `The document language looks LTR (${htmlLang}) but dir is “rtl”.`,
          evidence: {
            expected: 'dir="ltr" or omitted',
            found: 'dir="rtl"',
            source: `<html lang="${htmlLang}" dir="rtl">`,
          },
          selector: 'html',
        }),
      ];
    }

    return [pass(rtlDirMismatch, `Text direction is consistent with ${htmlLang}.`)];
  },
};
