import { localeDisplayName, scoreLabel } from '../locale/bcp47';
import { rules } from '../rules';
import { urlsEqual } from '../url';
import type { AuditContext, AuditReport } from '../types';
import { countBySeverity, computeScore } from './score';

export function runAudit(context: AuditContext, scannedAt = new Date().toISOString()): AuditReport {
  const findings = rules.flatMap((rule) => rule.run(context));
  const score = computeScore(findings);
  const locale = context.snapshot.htmlLang || selfHreflang(context) || '';
  return {
    version: 1,
    scannedAt,
    url: context.snapshot.url,
    locale,
    localeLabel: localeDisplayName(locale),
    score,
    scoreLabel: scoreLabel(score),
    counts: countBySeverity(findings),
    findings,
    snapshot: context.snapshot,
    http: context.http,
  };
}

function selfHreflang(context: AuditContext): string {
  const match = context.snapshot.hreflang.find((item) =>
    urlsEqual(item.href, context.snapshot.url, context.snapshot.url),
  );
  return match?.hreflang ?? '';
}
