import { storage } from 'wxt/utils/storage';
import { DEFAULT_SETTINGS, type LocaleSentrySettings, type AuditReport } from '../types';

export const settingsItem = storage.defineItem<LocaleSentrySettings>('local:settings', {
  fallback: DEFAULT_SETTINGS,
});

export const lastReportItem = storage.defineItem<AuditReport | null>('session:lastReport', {
  fallback: null,
});

export async function getSettings(): Promise<LocaleSentrySettings> {
  const value = await settingsItem.getValue();
  return { ...DEFAULT_SETTINGS, ...value };
}

export async function patchSettings(
  patch: Partial<LocaleSentrySettings>,
): Promise<LocaleSentrySettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await settingsItem.setValue(next);
  return next;
}
