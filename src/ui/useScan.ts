import { useCallback, useEffect, useState } from 'react';
import { lastReportItem } from '../lib/storage/settings';
import type { AuditReport } from '../lib/types';
import { send, type ReportResponse } from './bridge';

export function useScan() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    void send<ReportResponse>({ type: 'GET_LAST_REPORT' }).then((response) => {
      if (response.report) setReport(response.report);
    });
    const unwatch = lastReportItem.watch((value) => {
      setReport(value ?? null);
    });
    return () => {
      unwatch();
    };
  }, []);

  const scan = useCallback(async () => {
    setScanning(true);
    setError(null);
    const response = await send<ReportResponse>({ type: 'SCAN' });
    setScanning(false);
    if (response.error) {
      setError(response.error);
      return;
    }
    if (response.report) setReport(response.report);
  }, []);

  return { report, error, scanning, scan, setError };
}
