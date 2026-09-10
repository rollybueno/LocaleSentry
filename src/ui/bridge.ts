import type { AuditReport, LocaleSentrySettings } from '../lib/types';
import type { Message } from '../lib/messages';

export async function send<T>(message: Message): Promise<T> {
  return browser.runtime.sendMessage(message) as Promise<T>;
}

export interface ReportResponse {
  report?: AuditReport | null;
  error?: string;
}

export interface SettingsResponse {
  settings: LocaleSentrySettings;
  hasHostPermission: boolean;
  granted?: boolean;
  error?: string;
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function reportBasename(report: AuditReport): string {
  try {
    const host = new URL(report.url).hostname || 'page';
    return `localesentry-${host}`;
  } catch {
    return 'localesentry-report';
  }
}
