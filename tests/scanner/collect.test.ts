/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { collectPageSnapshot } from '../../src/lib/scanner/collect';
import { parseLinkHeader } from '../../src/lib/scanner/link-header';

describe('collector', () => {
  it('reads lang, canonical, hreflang, and missing alts from the DOM', () => {
    document.documentElement.lang = 'fr-FR';
    document.title = 'Produit';
    document.head.innerHTML = `
      <link rel="canonical" href="https://example.com/fr/product">
      <link rel="alternate" hreflang="fr" href="https://example.com/fr/product">
      <link rel="alternate" hreflang="en" href="https://example.com/product">
      <meta name="description" content="Bonjour">
      <meta property="og:locale" content="fr_FR">
    `;
    document.body.innerHTML = `<img src="/hero.jpg"><p>Texte français</p>`;

    const snapshot = collectPageSnapshot(document, 'https://example.com/fr/product');
    expect(snapshot.htmlLang).toBe('fr-FR');
    expect(snapshot.canonical).toBe('https://example.com/fr/product');
    expect(snapshot.hreflang).toHaveLength(2);
    expect(snapshot.images[0]?.alt).toBeNull();
    expect(snapshot.meta.ogLocale).toBe('fr_FR');
  });
});

describe('link header parser', () => {
  it('parses alternate hreflang entries', () => {
    const refs = parseLinkHeader(
      '</fr/product>; rel="alternate"; hreflang="fr", </product>; rel="alternate"; hreflang="x-default"',
      'https://example.com/fr/product',
    );
    expect(refs).toHaveLength(2);
    expect(refs[0]?.hreflang).toBe('fr');
    expect(refs[0]?.href).toBe('https://example.com/fr/product');
    expect(refs[1]?.source).toBe('http-header');
  });
});
