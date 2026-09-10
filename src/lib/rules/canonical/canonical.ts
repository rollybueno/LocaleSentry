import { languageSubtag, tagsMatch } from '../../locale/bcp47';
import { makeFinding, pass } from '../../audit/finding';
import { firstPathSegment, urlsEqual } from '../../url';
import type { AuditRule } from '../../types';

export const canonicalMissing: AuditRule = {
  id: 'canonical-missing',
  title: 'Canonical URL',
  category: 'canonical',
  defaultSeverity: 'warning',
  run(context) {
    if (context.snapshot.canonical) {
      return [pass(canonicalMissing, `Canonical is ${context.snapshot.canonical}.`)];
    }
    const multilingual = context.snapshot.hreflang.length > 0;
    return [
      makeFinding(canonicalMissing, {
        passed: false,
        severity: multilingual ? 'warning' : 'info',
        message: multilingual
          ? 'This multilingual page does not declare a canonical URL.'
          : 'No canonical URL was declared.',
        evidence: { expected: '<link rel="canonical" href="…">', found: 'missing' },
      }),
    ];
  },
};

export const canonicalLocaleConflict: AuditRule = {
  id: 'canonical-locale-conflict',
  title: 'Canonical locale conflict',
  category: 'canonical',
  defaultSeverity: 'error',
  run(context) {
    const canonical = context.snapshot.canonical;
    if (!canonical) {
      return [pass(canonicalLocaleConflict, 'No canonical URL to compare.')];
    }
    if (urlsEqual(canonical, context.snapshot.url, context.snapshot.url)) {
      return [pass(canonicalLocaleConflict, 'Canonical points at the current page.')];
    }

    const currentLocale = currentPageLocale(context);
    const canonicalLocale = localeForUrl(canonical, context);

    if (currentLocale && canonicalLocale && !tagsMatch(currentLocale, canonicalLocale)) {
      return [
        makeFinding(canonicalLocaleConflict, {
          passed: false,
          message: 'Canonical URL points at a different locale than the current page.',
          evidence: {
            expected: context.snapshot.url,
            found: canonical,
            source: context.snapshot.canonicalRaw ?? undefined,
          },
          locale: currentLocale,
          url: canonical,
        }),
      ];
    }

    const known = localePathCodes(context);
    const currentSeg = firstPathSegment(context.snapshot.url);
    const canonicalSeg = firstPathSegment(canonical, context.snapshot.url);
    if (
      currentSeg &&
      known.has(currentSeg.toLowerCase()) &&
      currentSeg.toLowerCase() !== (canonicalSeg ?? '').toLowerCase()
    ) {
      return [
        makeFinding(canonicalLocaleConflict, {
          passed: false,
          message: 'Canonical URL drops or changes the current locale path segment.',
          evidence: {
            expected: context.snapshot.url,
            found: canonical,
            source: context.snapshot.canonicalRaw ?? undefined,
          },
          locale: currentLocale,
          url: canonical,
        }),
      ];
    }

    return [pass(canonicalLocaleConflict, 'Canonical does not conflict with the current locale.')];
  },
};

function currentPageLocale(context: Parameters<AuditRule['run']>[0]): string {
  const self = context.snapshot.hreflang.find((ref) =>
    urlsEqual(ref.href, context.snapshot.url, context.snapshot.url),
  );
  return self?.hreflang || context.snapshot.htmlLang || '';
}

function localeForUrl(url: string, context: Parameters<AuditRule['run']>[0]): string {
  const match = context.snapshot.hreflang.find((ref) => urlsEqual(ref.href, url, context.snapshot.url));
  if (match) return match.hreflang;
  const seg = firstPathSegment(url, context.snapshot.url);
  if (seg && localePathCodes(context).has(seg.toLowerCase())) return seg;
  return '';
}

function localePathCodes(context: Parameters<AuditRule['run']>[0]): Set<string> {
  const codes = new Set<string>();
  if (context.snapshot.htmlLang) {
    codes.add(languageSubtag(context.snapshot.htmlLang));
    codes.add(context.snapshot.htmlLang.toLowerCase());
  }
  for (const ref of context.snapshot.hreflang) {
    if (!ref.hreflang || ref.hreflang.toLowerCase() === 'x-default') continue;
    codes.add(ref.hreflang.toLowerCase());
    codes.add(languageSubtag(ref.hreflang));
  }
  return codes;
}
