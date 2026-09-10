import type { AuditRule } from '../types';
import { htmlLangInvalid, htmlLangMissing } from './language/html-lang';
import { rtlDirMismatch } from './language/rtl-dir';
import {
  hreflangDuplicateLocale,
  hreflangDuplicateUrl,
  hreflangInvalid,
  hreflangMissing,
  hreflangMissingSelf,
  hreflangMissingXDefault,
} from './hreflang/links';
import { hreflangHttpError } from './hreflang/http';
import { canonicalLocaleConflict, canonicalMissing } from './canonical/canonical';
import { metaLanguageMismatch, metaTitleMissing, ogLocaleMismatch } from './metadata/metadata';
import { imgAltMissing, possibleLanguageMismatch } from './content/content';

export const rules: AuditRule[] = [
  htmlLangMissing,
  htmlLangInvalid,
  rtlDirMismatch,
  hreflangMissing,
  hreflangInvalid,
  hreflangDuplicateLocale,
  hreflangDuplicateUrl,
  hreflangMissingSelf,
  hreflangMissingXDefault,
  hreflangHttpError,
  canonicalMissing,
  canonicalLocaleConflict,
  metaTitleMissing,
  ogLocaleMismatch,
  metaLanguageMismatch,
  imgAltMissing,
  possibleLanguageMismatch,
];
