import { isValidLanguageTag, isXDefault } from '../../locale/bcp47';
import { makeFinding, pass } from '../../audit/finding';
import { urlsEqual } from '../../url';
import type { AuditRule } from '../../types';

export const hreflangMissing: AuditRule = {
  id: 'hreflang-missing',
  title: 'hreflang alternates',
  category: 'hreflang',
  defaultSeverity: 'warning',
  run(context) {
    if (context.snapshot.hreflang.length === 0) {
      return [
        makeFinding(hreflangMissing, {
          passed: false,
          message: 'No hreflang alternate links were found on this page.',
          evidence: {
            expected: '<link rel="alternate" hreflang="…" href="…">',
            found: 'none',
          },
        }),
      ];
    }
    return [pass(hreflangMissing, `${context.snapshot.hreflang.length} hreflang alternate(s) found.`)];
  },
};

export const hreflangInvalid: AuditRule = {
  id: 'hreflang-invalid',
  title: 'hreflang syntax',
  category: 'hreflang',
  defaultSeverity: 'error',
  run(context) {
    const findings = context.snapshot.hreflang.flatMap((ref) => {
      const issues: ReturnType<typeof makeFinding>[] = [];
      if (!ref.hreflang || !isValidLanguageTag(ref.hreflang)) {
        issues.push(
          makeFinding(hreflangInvalid, {
            passed: false,
            message: `Invalid hreflang value “${ref.hreflang || '(empty)'}”.`,
            evidence: { found: ref.hreflang, source: ref.raw },
            locale: ref.hreflang,
            url: ref.href,
            idSuffix: `code:${ref.hreflang}:${ref.href}`,
          }),
        );
      }
      try {
        new URL(ref.href);
      } catch {
        issues.push(
          makeFinding(hreflangInvalid, {
            passed: false,
            message: `hreflang URL is not valid: ${ref.href || '(empty)'}`,
            evidence: { found: ref.href, source: ref.raw },
            locale: ref.hreflang,
            url: ref.href,
            idSuffix: `url:${ref.hreflang}:${ref.href}`,
          }),
        );
      }
      return issues;
    });
    if (findings.length) return findings;
    return [pass(hreflangInvalid, 'hreflang values and URLs are syntactically valid.')];
  },
};

export const hreflangDuplicateLocale: AuditRule = {
  id: 'hreflang-duplicate-locale',
  title: 'Duplicate hreflang locales',
  category: 'hreflang',
  defaultSeverity: 'error',
  run(context) {
    const grouped = groupBy(context.snapshot.hreflang, (ref) => ref.hreflang.trim().toLowerCase());
    const dups = [...grouped.entries()].filter(([key, items]) => key && items.length > 1);
    if (!dups.length) {
      return [pass(hreflangDuplicateLocale, 'No duplicate hreflang locales.')];
    }
    return dups.map(([locale, items]) =>
      makeFinding(hreflangDuplicateLocale, {
        passed: false,
        message: `Locale “${locale}” is declared ${items.length} times.`,
        evidence: { found: items.map((item) => item.href).join('\n'), source: items[0]?.raw },
        locale,
        idSuffix: locale,
      }),
    );
  },
};

export const hreflangDuplicateUrl: AuditRule = {
  id: 'hreflang-duplicate-url',
  title: 'Duplicate hreflang URLs',
  category: 'hreflang',
  defaultSeverity: 'warning',
  run(context) {
    const nonDefault = context.snapshot.hreflang.filter((ref) => !isXDefault(ref.hreflang));
    const grouped = groupBy(nonDefault, (ref) => {
      try {
        return new URL(ref.href).href.replace(/\/$/, '');
      } catch {
        return ref.href;
      }
    });
    const dups = [...grouped.entries()].filter(([, items]) => {
      const locales = new Set(items.map((item) => item.hreflang.toLowerCase()));
      return locales.size > 1;
    });
    if (!dups.length) {
      return [pass(hreflangDuplicateUrl, 'Non-default locales point at distinct URLs.')];
    }
    return dups.map(([url, items]) =>
      makeFinding(hreflangDuplicateUrl, {
        passed: false,
        message: `Multiple locales share the same URL: ${items.map((item) => item.hreflang).join(', ')}`,
        evidence: { found: url, source: items.map((item) => item.raw).join('\n') },
        url,
        idSuffix: url,
      }),
    );
  },
};

export const hreflangMissingSelf: AuditRule = {
  id: 'hreflang-missing-self',
  title: 'hreflang self-reference',
  category: 'hreflang',
  defaultSeverity: 'warning',
  run(context) {
    if (!context.snapshot.hreflang.length) {
      return [pass(hreflangMissingSelf, 'No hreflang set to self-reference.')];
    }
    const hasSelf = context.snapshot.hreflang.some((ref) =>
      urlsEqual(ref.href, context.snapshot.url, context.snapshot.url),
    );
    if (!hasSelf) {
      return [
        makeFinding(hreflangMissingSelf, {
          passed: false,
          message: 'The hreflang set does not include the current page URL.',
          evidence: {
            expected: context.snapshot.url,
            found: context.snapshot.hreflang.map((ref) => ref.href).join('\n'),
          },
        }),
      ];
    }
    return [pass(hreflangMissingSelf, 'hreflang includes a self-reference.')];
  },
};

export const hreflangMissingXDefault: AuditRule = {
  id: 'hreflang-missing-x-default',
  title: 'x-default hreflang',
  category: 'hreflang',
  defaultSeverity: 'warning',
  run(context) {
    if (!context.snapshot.hreflang.length) {
      return [pass(hreflangMissingXDefault, 'No hreflang set; x-default is not required yet.')];
    }
    if (context.snapshot.hreflang.some((ref) => isXDefault(ref.hreflang))) {
      return [pass(hreflangMissingXDefault, 'x-default is declared.')];
    }
    return [
      makeFinding(hreflangMissingXDefault, {
        passed: false,
        message: 'hreflang is present but x-default is not declared.',
        evidence: { expected: 'hreflang="x-default"', found: 'missing' },
      }),
    ];
  },
};

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}
