import type { HreflangRef } from '../types';
import { resolveUrl } from '../url';

export function parseLinkHeader(header: string | null | undefined, pageUrl: string): HreflangRef[] {
  if (!header?.trim()) return [];
  const refs: HreflangRef[] = [];
  const parts = splitLinkHeader(header);

  for (const part of parts) {
    const urlMatch = part.match(/<([^>]+)>/);
    const hrefRaw = urlMatch?.[1];
    if (!hrefRaw) continue;
    const params = Object.fromEntries(
      [...part.matchAll(/;\s*([^=\s]+)\s*=\s*(?:"([^"]*)"|([^;,]+))/g)].map((match) => [
        (match[1] ?? '').toLowerCase(),
        (match[2] ?? match[3] ?? '').trim(),
      ]),
    );
    const rel = params.rel?.toLowerCase() ?? '';
    const hreflang = params.hreflang ?? '';
    if (!rel.split(/\s+/).includes('alternate') || !hreflang) continue;
    const href = resolveUrl(hrefRaw, pageUrl) ?? hrefRaw;
    refs.push({
      hreflang,
      href,
      source: 'http-header',
      raw: part.trim(),
    });
  }

  return refs;
}

function splitLinkHeader(header: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of header) {
    if (char === '"') inQuotes = !inQuotes;
    if (char === ',' && !inQuotes) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current);
  return parts;
}
