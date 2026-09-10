const RTL_LANGUAGES = new Set([
  'ar',
  'fa',
  'he',
  'ur',
  'yi',
  'dv',
  'ps',
  'ku',
  'sd',
  'ug',
  'ckb',
]);

export function isRtlLanguage(tag: string): boolean {
  const lang = tag.trim().toLowerCase().replaceAll('_', '-').split('-')[0];
  return RTL_LANGUAGES.has(lang ?? '');
}
