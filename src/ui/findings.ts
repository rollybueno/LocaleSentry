import type { AuditFinding, Severity } from '../lib/types';

export const SEVERITY_ORDER: Severity[] = ['error', 'warning', 'review', 'info', 'passed'];

export function visibleFindings(
  findings: AuditFinding[],
  filter: Severity | 'all',
  includePassed: boolean,
): AuditFinding[] {
  return findings.filter((finding) => {
    if (filter !== 'all' && finding.severity !== filter) return false;
    if (!includePassed && finding.passed && finding.severity === 'passed') return false;
    return true;
  });
}
