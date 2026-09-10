export type Message =
  | { type: 'PING' }
  | { type: 'SCAN' }
  | { type: 'COLLECT_SNAPSHOT' }
  | { type: 'HIGHLIGHT'; selector: string }
  | { type: 'CLEAR_HIGHLIGHT' }
  | { type: 'GET_LAST_REPORT' }
  | { type: 'REQUEST_HOST_PERMISSION' }
  | { type: 'REVOKE_HOST_PERMISSION' }
  | { type: 'GET_SETTINGS' }
  | { type: 'SET_SETTINGS'; settings: Partial<import('./types').LocaleSentrySettings> }
  | { type: 'HAS_HOST_PERMISSION' };

export type HighlightResult = { ok: boolean; reason?: string };

export const OPTIONAL_HOST_PERMISSIONS = ['*://*/*'] as const;
