import { collectPageSnapshot } from '../lib/scanner/collect';
import { clearHighlight, highlightSelector } from '../lib/scanner/highlight';
import type { Message } from '../lib/messages';

export default defineUnlistedScript(() => {
  const root = globalThis as typeof globalThis & { __localesentry?: boolean };
  if (root.__localesentry) return;
  root.__localesentry = true;

  browser.runtime.onMessage.addListener(
    (message: Message, _sender: unknown, sendResponse: (response: unknown) => void) => {
      if (message.type === 'PING') {
        sendResponse({ ok: true });
        return;
      }
      if (message.type === 'COLLECT_SNAPSHOT') {
        sendResponse(collectPageSnapshot(document, location.href));
        return;
      }
      if (message.type === 'HIGHLIGHT') {
        sendResponse(highlightSelector(message.selector));
        return;
      }
      if (message.type === 'CLEAR_HIGHLIGHT') {
        clearHighlight();
        sendResponse({ ok: true });
      }
    },
  );
});
