import type { AuditFinding, AuditRule, Severity } from '../types';

let seq = 0;

export function makeFinding(
  rule: AuditRule,
  input: {
    severity?: Severity;
    passed: boolean;
    message: string;
    evidence?: AuditFinding['evidence'];
    selector?: string;
    locale?: string;
    url?: string;
    idSuffix?: string;
  },
): AuditFinding {
  seq += 1;
  return {
    id: `${rule.id}:${input.idSuffix ?? seq}`,
    ruleId: rule.id,
    title: rule.title,
    category: rule.category,
    severity: input.passed ? 'passed' : (input.severity ?? rule.defaultSeverity),
    passed: input.passed,
    message: input.message,
    evidence: input.evidence,
    selector: input.selector,
    locale: input.locale,
    url: input.url,
  };
}

export function pass(rule: AuditRule, message: string): AuditFinding {
  return makeFinding(rule, { passed: true, message });
}
