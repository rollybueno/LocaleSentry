import type { HttpCheckResult, HttpResults, PageSnapshot } from '../types';
import { normalizeUrl } from '../url';

const TIMEOUT_MS = 8000;

export async function fetchLinkHeader(pageUrl: string): Promise<string | null> {
  try {
    const response = await fetchWithTimeout(pageUrl, { method: 'GET' });
    return response.headers.get('Link');
  } catch {
    return null;
  }
}

export async function validateRemoteUrls(
  snapshot: PageSnapshot,
  enabled: boolean,
  permissionGranted: boolean,
): Promise<HttpResults> {
  if (!enabled || !permissionGranted) {
    return { enabled, permissionGranted, checks: [] };
  }

  const urls = uniqueUrls([
    ...snapshot.hreflang.map((ref) => ref.href),
    snapshot.canonical,
  ]);

  const checks = await Promise.all(urls.map((url) => checkUrl(url)));
  return { enabled, permissionGranted, checks };
}

export async function checkUrl(url: string): Promise<HttpCheckResult> {
  try {
    const head = await fetchWithTimeout(url, { method: 'HEAD' });
    return toResult(url, head);
  } catch {
    try {
      const get = await fetchWithTimeout(url, { method: 'GET' });
      return toResult(url, get);
    } catch (error) {
      return {
        url,
        ok: false,
        status: null,
        redirected: false,
        finalUrl: null,
        error: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }
}

function toResult(url: string, response: Response): HttpCheckResult {
  const finalUrl = response.url || url;
  const redirected = response.redirected || normalizeUrl(finalUrl) !== normalizeUrl(url);
  const ok = response.ok && !redirected;
  return {
    url,
    ok,
    status: response.status,
    redirected,
    finalUrl,
  };
}

function uniqueUrls(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const value of values) {
    if (!value) continue;
    try {
      const href = new URL(value).href;
      if (seen.has(href)) continue;
      seen.add(href);
      urls.push(href);
    } catch {
      // skip invalid
    }
  }
  return urls;
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}
