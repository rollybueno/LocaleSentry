import { runAudit } from '../lib/audit/engine';
import { hasHostPermission, requestHostPermission, revokeHostPermission } from '../lib/http/permissions';
import { fetchLinkHeader, validateRemoteUrls } from '../lib/http/reachability';
import type { Message } from '../lib/messages';
import { mergeLinkHeaderAlternates } from '../lib/scanner/collect';
import { getSettings, lastReportItem, patchSettings } from '../lib/storage/settings';
import type { PageSnapshot } from '../lib/types';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    (
      message: Message,
      sender: { tab?: { id?: number } },
      sendResponse: (response: unknown) => void,
    ) => {
      void handleMessage(message, sender)
        .then(sendResponse)
        .catch((error: unknown) => {
          sendResponse({
            error: error instanceof Error ? error.message : 'Unexpected error',
          });
        });
      return true;
    },
  );
});

async function handleMessage(message: Message, sender: { tab?: { id?: number } }) {
  switch (message.type) {
    case 'SCAN':
      return { report: await scanActiveTab() };
    case 'GET_LAST_REPORT':
      return { report: await lastReportItem.getValue() };
    case 'GET_SETTINGS':
      return { settings: await getSettings(), hasHostPermission: await hasHostPermission() };
    case 'SET_SETTINGS': {
      const settings = await patchSettings(message.settings);
      if (message.settings.checkRemoteUrls === false) {
        try {
          await revokeHostPermission();
        } catch {
          // Firefox may not allow removal; ignore.
        }
      }
      return { settings, hasHostPermission: await hasHostPermission() };
    }
    case 'REQUEST_HOST_PERMISSION': {
      const granted = await requestHostPermission();
      const settings = granted
        ? await patchSettings({ checkRemoteUrls: true })
        : await getSettings();
      return { granted, settings, hasHostPermission: granted };
    }
    case 'HAS_HOST_PERMISSION':
      return { hasHostPermission: await hasHostPermission() };
    case 'OPEN_SIDEPANEL':
      return openSidePanel();
    case 'HIGHLIGHT': {
      const settings = await getSettings();
      if (!settings.highlightElements) {
        return { ok: false, reason: 'Element highlighting is disabled in settings.' };
      }
      return forwardToTab(message, sender.tab?.id);
    }
    case 'CLEAR_HIGHLIGHT':
      return forwardToTab(message, sender.tab?.id);
    default:
      return { error: 'Unknown message' };
  }
}

async function scanActiveTab() {
  const tab = await activeHttpTab();
  await injectContentScript(tab.id);
  const snapshot = (await browser.tabs.sendMessage(tab.id, {
    type: 'COLLECT_SNAPSHOT',
  })) as PageSnapshot;

  const linkHeader = await fetchLinkHeader(tab.url);
  snapshot.hreflang = mergeLinkHeaderAlternates(snapshot.hreflang, linkHeader, snapshot.url);

  const settings = await getSettings();
  const permissionGranted = settings.checkRemoteUrls ? await hasHostPermission() : false;
  const http = await validateRemoteUrls(snapshot, settings.checkRemoteUrls, permissionGranted);
  const report = runAudit({ snapshot, http, settings });
  await lastReportItem.setValue(report);
  return report;
}

async function activeHttpTab() {
  for (const query of [
    { active: true, lastFocusedWindow: true } as const,
    { active: true, currentWindow: true } as const,
  ]) {
    const [tab] = await browser.tabs.query(query);
    if (tab?.id && tab.url && /^https?:/i.test(tab.url)) {
      return { id: tab.id, url: tab.url };
    }
  }
  throw new Error(
    'LocaleSentry can only scan http(s) pages. Open a website tab and scan from the toolbar popup.',
  );
}

async function injectContentScript(tabId: number) {
  try {
    await browser.tabs.sendMessage(tabId, { type: 'PING' });
  } catch {
    await browser.scripting.executeScript({
      target: { tabId },
      files: ['/page-collect.js'],
    });
  }
}

async function forwardToTab(message: Message, tabId?: number) {
  const id = tabId ?? (await activeHttpTab()).id;
  try {
    await injectContentScript(id);
    return await browser.tabs.sendMessage(id, message);
  } catch {
    return { ok: false, reason: 'Could not reach the page. Scan it first.' };
  }
}

async function openSidePanel() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return { ok: false, reason: 'No active tab.' };
  const sidePanel = browser.sidePanel as
    | { open: (options: { tabId: number }) => Promise<void> }
    | undefined;
  if (sidePanel?.open) {
    await sidePanel.open({ tabId: tab.id });
    return { ok: true };
  }
  const sidebarAction = (
    browser as typeof browser & {
      sidebarAction?: { open: () => Promise<void> };
    }
  ).sidebarAction;
  if (sidebarAction?.open) {
    await sidebarAction.open();
    return { ok: true };
  }
  return { ok: false, reason: 'Side panel is not available in this browser.' };
}
