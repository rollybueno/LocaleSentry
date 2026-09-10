import type { AuditReport } from '../types';

export function reportToJson(report: AuditReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function reportToCsv(report: AuditReport): string {
  const rows = [
    csvRow(['ruleId', 'severity', 'passed', 'message', 'url', 'selector', 'locale']),
    ...report.findings.map((finding) =>
      csvRow([
        finding.ruleId,
        finding.severity,
        finding.passed ? 'true' : 'false',
        finding.message,
        finding.url ?? '',
        finding.selector ?? '',
        finding.locale ?? '',
      ]),
    ),
  ];
  return `${rows.join('\n')}\n`;
}

export function reportToMarkdown(report: AuditReport): string {
  const lines = [
    '# LocaleSentry Report',
    '',
    `URL: ${report.url}`,
    `Locale: ${report.localeLabel}${report.locale ? ` (${report.locale})` : ''}`,
    `Score: ${report.score}/100 (${report.scoreLabel})`,
    `Scanned: ${report.scannedAt}`,
    '',
    `Errors: ${report.counts.error} · Warnings: ${report.counts.warning} · Review: ${report.counts.review} · Passed: ${report.counts.passed}`,
    '',
  ];

  const groups: Array<[string, AuditReport['findings']]> = [
    ['Errors', report.findings.filter((item) => !item.passed && item.severity === 'error')],
    ['Warnings', report.findings.filter((item) => !item.passed && item.severity === 'warning')],
    ['Review', report.findings.filter((item) => !item.passed && item.severity === 'review')],
    ['Info', report.findings.filter((item) => item.severity === 'info')],
  ];

  for (const [heading, items] of groups) {
    if (!items.length) continue;
    lines.push(`## ${heading}`, '');
    for (const item of items) {
      lines.push(`### ${item.title}`);
      lines.push('');
      lines.push(`Rule: \`${item.ruleId}\``);
      lines.push('');
      lines.push(item.message);
      if (item.evidence?.expected) lines.push('', `Expected: ${item.evidence.expected}`);
      if (item.evidence?.found) lines.push(`Found: ${item.evidence.found}`);
      if (item.evidence?.source) {
        lines.push('', '```html', item.evidence.source, '```');
      }
      if (item.url) lines.push('', `URL: ${item.url}`);
      if (item.selector) lines.push(`Selector: \`${item.selector}\``);
      lines.push('');
    }
  }

  return `${lines.join('\n').trim()}\n`;
}

function csvRow(values: string[]): string {
  return values.map(csvCell).join(',');
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}
