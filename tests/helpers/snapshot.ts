import {
  DEFAULT_SETTINGS,
  type AuditReport,
  type HttpResults,
  type LocaleSentrySettings,
  type PageSnapshot,
} from '../../src/lib/types';

export function makeSnapshot(over: Partial<PageSnapshot> = {}): PageSnapshot {
  return {
    url: 'https://example.com/fr/product',
    htmlLang: 'fr',
    dir: '',
    title: 'Produit exemple',
    canonical: 'https://example.com/fr/product',
    canonicalRaw: '<link rel="canonical" href="https://example.com/fr/product">',
    hreflang: [
      {
        hreflang: 'en',
        href: 'https://example.com/product',
        source: 'link-tag',
        raw: '<link rel="alternate" hreflang="en" href="https://example.com/product">',
      },
      {
        hreflang: 'fr',
        href: 'https://example.com/fr/product',
        source: 'link-tag',
        raw: '<link rel="alternate" hreflang="fr" href="https://example.com/fr/product">',
      },
      {
        hreflang: 'x-default',
        href: 'https://example.com/product',
        source: 'link-tag',
        raw: '<link rel="alternate" hreflang="x-default" href="https://example.com/product">',
      },
    ],
    meta: {
      description: 'Description du produit en français pour cette page de démonstration.',
      ogTitle: 'Produit exemple',
      ogDescription: 'Description du produit en français pour cette page de démonstration.',
      ogLocale: 'fr_FR',
      ogLocaleAlternates: ['en_US'],
      twitterTitle: 'Produit exemple',
      twitterDescription: 'Description du produit en français.',
    },
    images: [
      {
        src: '/hero.jpg',
        alt: 'Photo du produit',
        selector: 'img',
        raw: '<img src="/hero.jpg" alt="Photo du produit">',
      },
    ],
    sampledText:
      "Ceci est un paragraphe en français assez long pour décrire le produit et permettre une détection de langue fiable sur cette page d'exemple.",
    titleAndMetaText:
      'Produit exemple Description du produit en français pour cette page de démonstration.',
    ...over,
  };
}

export function makeContext(
  snapshotOver: Partial<PageSnapshot> = {},
  settingsOver: Partial<LocaleSentrySettings> = {},
  httpOver: Partial<HttpResults> = {},
) {
  return {
    snapshot: makeSnapshot(snapshotOver),
    settings: { ...DEFAULT_SETTINGS, detectContentLanguage: false, ...settingsOver },
    http: {
      enabled: false,
      permissionGranted: false,
      checks: [],
      ...httpOver,
    },
  };
}

export function failed(report: Pick<AuditReport, 'findings'> | { findings: AuditReport['findings'] }, ruleId: string) {
  return report.findings.filter((item) => item.ruleId === ruleId && !item.passed && item.severity !== 'info');
}
