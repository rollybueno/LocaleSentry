const LANGUAGE_RE = /^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/;

export function isXDefault(tag: string): boolean {
  return tag.trim().toLowerCase() === 'x-default';
}

export function normalizeTag(tag: string): string {
  return tag.trim().replaceAll('_', '-').toLowerCase();
}

export function languageSubtag(tag: string): string {
  return normalizeTag(tag).split('-')[0] ?? '';
}

export function isValidLanguageTag(tag: string): boolean {
  const trimmed = tag.trim();
  if (!trimmed) return false;
  if (isXDefault(trimmed)) return true;
  if (trimmed.includes('_')) return false;
  if (!LANGUAGE_RE.test(trimmed)) return false;
  try {
    Intl.getCanonicalLocales(trimmed);
    return true;
  } catch {
    return false;
  }
}

export function tagsMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (isXDefault(a) || isXDefault(b)) return false;
  const na = normalizeTag(a);
  const nb = normalizeTag(b);
  if (na === nb) return true;
  const la = languageSubtag(na);
  const lb = languageSubtag(nb);
  if (la !== lb) return false;
  const ra = na.split('-')[1];
  const rb = nb.split('-')[1];
  return !ra || !rb || ra === rb;
}

export function localeDisplayName(tag: string, locale = 'en'): string {
  if (!tag) return 'Unknown';
  if (isXDefault(tag)) return 'x-default';
  try {
    const name = new Intl.DisplayNames([locale], { type: 'language' }).of(languageSubtag(tag));
    return name ? `${name} — ${tag}` : tag;
  } catch {
    return tag;
  }
}

export function scoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}
