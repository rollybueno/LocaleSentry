export function resolveUrl(href: string, baseUrl: string): string | null {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

export function normalizeUrl(href: string, baseUrl?: string): string | null {
  try {
    const url = new URL(href, baseUrl);
    url.hash = '';
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }
    url.searchParams.sort();
    return url.href;
  } catch {
    return null;
  }
}

export function urlsEqual(a: string, b: string, baseUrl?: string): boolean {
  const left = normalizeUrl(a, baseUrl);
  const right = normalizeUrl(b, baseUrl);
  return Boolean(left && right && left === right);
}

export function firstPathSegment(href: string, baseUrl?: string): string | null {
  try {
    const url = new URL(href, baseUrl);
    const segment = url.pathname.split('/').filter(Boolean)[0];
    return segment ? decodeURIComponent(segment) : null;
  } catch {
    return null;
  }
}
