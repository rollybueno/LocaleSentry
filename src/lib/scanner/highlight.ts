export function highlightSelector(selector: string): { ok: boolean; reason?: string } {
  const el = document.querySelector(selector);
  if (!(el instanceof Element)) {
    return { ok: false, reason: 'The element is no longer on the page.' };
  }
  el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
  const rect = el.getBoundingClientRect();
  const host = ensureHost();
  const box = host.shadowRoot!.getElementById('box')!;
  box.style.top = `${rect.top + window.scrollY - 4}px`;
  box.style.left = `${rect.left + window.scrollX - 4}px`;
  box.style.width = `${rect.width + 8}px`;
  box.style.height = `${rect.height + 8}px`;
  host.style.display = 'block';
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  (host as HTMLElement & { __selector?: string }).__selector = selector;
  return { ok: true };
}

export function clearHighlight(): void {
  const host = document.getElementById('localesentry-highlight');
  if (host) host.style.display = 'none';
  window.removeEventListener('scroll', sync);
  window.removeEventListener('resize', sync);
}

function sync() {
  const host = document.getElementById('localesentry-highlight') as
    | (HTMLElement & { __selector?: string })
    | null;
  if (!host?.__selector) return;
  highlightSelector(host.__selector);
}

function ensureHost(): HTMLElement {
  let host = document.getElementById('localesentry-highlight');
  if (host) return host;
  host = document.createElement('div');
  host.id = 'localesentry-highlight';
  host.style.all = 'initial';
  host.style.position = 'absolute';
  host.style.inset = '0';
  host.style.pointerEvents = 'none';
  host.style.zIndex = '2147483647';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      #box {
        position: absolute;
        border: 2px solid #d4a017;
        box-shadow: 0 0 0 1px rgba(22, 20, 16, 0.7), 0 8px 24px rgba(0, 0, 0, 0.35);
        border-radius: 4px;
        background: rgba(212, 160, 23, 0.12);
      }
    </style>
    <div id="box"></div>
  `;
  document.documentElement.append(host);
  return host;
}
