type OpenResult = (error?: string) => void;

interface ChromeLike {
  windows: {
    getLastFocused: (callback: (win?: { id?: number }) => void) => void;
  };
  tabs: {
    query: (
      query: { active: boolean; lastFocusedWindow: boolean },
      callback: (tabs: Array<{ id?: number }>) => void,
    ) => void;
  };
  sidePanel?: {
    open: (options: { tabId?: number; windowId?: number }) => Promise<void>;
  };
}

function chromeApi(): ChromeLike | undefined {
  return (globalThis as { chrome?: ChromeLike }).chrome;
}

export function openSidePanelFromUi(onResult: OpenResult): void {
  const chromeSidePanel = chromeApi()?.sidePanel;
  if (chromeSidePanel?.open) {
    chromeApi()!.windows.getLastFocused((win) => {
      if (win?.id) {
        void chromeSidePanel
          .open({ windowId: win.id })
          .then(() => onResult())
          .catch((error: unknown) => onResult(messageFrom(error)));
        return;
      }

      chromeApi()!.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (!tabId) {
          onResult('No browser window to attach the panel to.');
          return;
        }
        void chromeSidePanel
          .open({ tabId })
          .then(() => onResult())
          .catch((error: unknown) => onResult(messageFrom(error)));
      });
    });
    return;
  }

  const sidebarAction = (
    browser as typeof browser & { sidebarAction?: { open: () => Promise<void> } }
  ).sidebarAction;
  if (sidebarAction?.open) {
    void sidebarAction
      .open()
      .then(() => onResult())
      .catch((error: unknown) => onResult(messageFrom(error)));
    return;
  }

  onResult('Side panel requires Chrome 114 or newer.');
}

function messageFrom(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Could not open the side panel.';
}
