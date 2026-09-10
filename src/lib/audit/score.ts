import { SCORE_WEIGHTS, type AuditFinding } from '../types';

export function computeScore(findings: AuditFinding[]): number {
  let score = 100;
  for (const finding of findings) {
    if (finding.passed) continue;
    score -= SCORE_WEIGHTS[finding.severity];
  }
  return Math.max(0, score);
}

export function countBySeverity(findings: AuditFinding[]) {
  const counts = { error: 0, warning: 0, review: 0, info: 0, passed: 0 };
  for (const finding of findings) {
    counts[finding.severity] += 1;
  }
  return counts;
}
