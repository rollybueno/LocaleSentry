import type { HreflangRef, ImageRecord, PageSnapshot } from '../types';
import { parseLinkHeader } from './link-header';
import { resolveUrl } from '../url';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG']);
const MAX_IMAGES = 80;
const MAX_SAMPLE_CHARS = 2500;

export function cssPath(el: Element): string {
  if (el.id) return `#${CSS.escape(el.id)}`;
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && parts.length < 6) {
    const parent: Element | null = node.parentElement;
    const tag = node.tagName.toLowerCase();
    if (!parent) {
      parts.unshift(tag);
      break;
    }
    const siblings = [...parent.children].filter((child) => child.tagName === node!.tagName);
    const index = siblings.indexOf(node) + 1;
    parts.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${index})` : tag);
    node = parent;
  }
  return parts.join(' > ');
}

function metaContent(doc: Document, selector: string): string | null {
  const el = doc.querySelector(selector);
  const content = el?.getAttribute('content')?.trim();
  return content || null;
}

function collectHreflang(doc: Document, pageUrl: string): HreflangRef[] {
  const refs: HreflangRef[] = [];
  for (const link of doc.querySelectorAll('link[rel~="alternate"][hreflang]')) {
    const hreflang = link.getAttribute('hreflang')?.trim() ?? '';
    const hrefAttr = link.getAttribute('href')?.trim() ?? '';
    const href = resolveUrl(hrefAttr, pageUrl) ?? hrefAttr;
    refs.push({
      hreflang,
      href,
      source: 'link-tag',
      raw: link.outerHTML,
    });
  }
  return refs;
}

function collectImages(doc: Document): ImageRecord[] {
  const images: ImageRecord[] = [];
  for (const img of doc.querySelectorAll('img')) {
    if (images.length >= MAX_IMAGES) break;
    images.push({
      src: img.getAttribute('src') ?? '',
      alt: img.hasAttribute('alt') ? (img.getAttribute('alt') ?? '') : null,
      selector: cssPath(img),
      raw: img.outerHTML.slice(0, 400),
    });
  }
  return images;
}

function collectSampledText(doc: Document): string {
  const walker = doc.createTreeWalker(doc.body ?? doc.documentElement, NodeFilter.SHOW_TEXT);
  const chunks: string[] = [];
  let total = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (!parent || SKIP_TAGS.has(parent.tagName)) continue;
    const text = node.textContent?.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    chunks.push(text);
    total += text.length;
    if (total >= MAX_SAMPLE_CHARS) break;
  }
  return chunks.join(' ').slice(0, MAX_SAMPLE_CHARS);
}

export function mergeLinkHeaderAlternates(
  existing: HreflangRef[],
  header: string | null,
  pageUrl: string,
): HreflangRef[] {
  const fromHeader = parseLinkHeader(header, pageUrl);
  const seen = new Set(existing.map((item) => `${item.hreflang}::${item.href}`));
  const merged = [...existing];
  for (const item of fromHeader) {
    const key = `${item.hreflang}::${item.href}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

export function collectPageSnapshot(
  doc: Document,
  pageUrl: string,
  linkHeader?: string | null,
): PageSnapshot {
  const html = doc.documentElement;
  const title = doc.title?.trim() ?? '';
  const canonicalEl = doc.querySelector('link[rel="canonical"]');
  const canonicalAttr = canonicalEl?.getAttribute('href')?.trim() || null;
  const description = metaContent(doc, 'meta[name="description"]');
  const ogTitle = metaContent(doc, 'meta[property="og:title"]');
  const ogDescription = metaContent(doc, 'meta[property="og:description"]');
  const ogLocale = metaContent(doc, 'meta[property="og:locale"]');
  const twitterTitle = metaContent(doc, 'meta[name="twitter:title"]');
  const twitterDescription = metaContent(doc, 'meta[name="twitter:description"]');
  const ogLocaleAlternates = [...doc.querySelectorAll('meta[property="og:locale:alternate"]')]
    .map((el) => el.getAttribute('content')?.trim() ?? '')
    .filter(Boolean);

  const hreflang = mergeLinkHeaderAlternates(collectHreflang(doc, pageUrl), linkHeader ?? null, pageUrl);
  const titleAndMetaText = [title, description, ogTitle, ogDescription].filter(Boolean).join(' ');

  return {
    url: pageUrl,
    htmlLang: html.getAttribute('lang')?.trim() ?? '',
    dir: (html.getAttribute('dir') ?? '').trim().toLowerCase(),
    title,
    canonical: canonicalAttr ? (resolveUrl(canonicalAttr, pageUrl) ?? canonicalAttr) : null,
    canonicalRaw: canonicalEl?.outerHTML ?? null,
    hreflang,
    meta: {
      description,
      ogTitle,
      ogDescription,
      ogLocale,
      ogLocaleAlternates,
      twitterTitle,
      twitterDescription,
    },
    images: collectImages(doc),
    sampledText: collectSampledText(doc),
    titleAndMetaText,
  };
}
