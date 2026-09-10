import { makeFinding, pass } from '../../audit/finding';
import type { AuditRule } from '../../types';

export const hreflangHttpError: AuditRule = {
  id: 'hreflang-http-error',
  title: 'hreflang URL reachability',
  category: 'hreflang',
  defaultSeverity: 'error',
  run(context) {
    if (!context.http.enabled || !context.http.permissionGranted) {
      return [
        makeFinding(hreflangHttpError, {
          passed: false,
          severity: 'info',
          message: 'Remote URL checks are disabled. Enable them in settings to validate alternate URLs.',
        }),
      ];
    }

    if (!context.snapshot.hreflang.length) {
      return [pass(hreflangHttpError, 'No hreflang URLs to check.')];
    }

    const findings = context.http.checks.flatMap((check) => {
      if (check.ok && check.status && check.status >= 200 && check.status < 300 && !check.redirected) {
        return [];
      }
      if (check.redirected) {
        return [
          makeFinding(hreflangHttpError, {
            passed: false,
            severity: 'warning',
            message: `Alternate URL redirected (${check.status ?? 'unknown'}).`,
            evidence: {
              expected: 'HTTP 200 at the declared URL',
              found: `${check.status ?? 'redirect'} → ${check.finalUrl ?? check.url}`,
            },
            url: check.url,
            idSuffix: check.url,
          }),
        ];
      }
      return [
        makeFinding(hreflangHttpError, {
          passed: false,
          message: `Alternate URL is not reachable (${check.status ?? check.error ?? 'failed'}).`,
          evidence: {
            expected: 'HTTP 200',
            found: String(check.status ?? check.error ?? 'request failed'),
          },
          url: check.url,
          idSuffix: check.url,
        }),
      ];
    });

    if (!findings.length) {
      return [pass(hreflangHttpError, 'hreflang URLs responded with HTTP 200.')];
    }
    return findings;
  },
};
