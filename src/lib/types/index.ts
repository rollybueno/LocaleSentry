export type Severity = 'error' | 'warning' | 'review' | 'info' | 'passed';

export type RuleCategory = 'language' | 'hreflang' | 'canonical' | 'metadata' | 'content';

export interface LocaleSentrySettings {
  detectContentLanguage: boolean;
  checkRemoteUrls: boolean;
  highlightElements: boolean;
  includePassedRules: boolean;
}

export interface HreflangRef {
  hreflang: string;
  href: string;
  source: 'link-tag' | 'http-header';
  raw: string;
}

export interface ImageRecord {
  src: string;
  alt: string | null;
  selector: string;
  raw: string;
}

export interface PageSnapshot {
  url: string;
  htmlLang: string;
  dir: string;
  title: string;
  canonical: string | null;
  canonicalRaw: string | null;
  hreflang: HreflangRef[];
  meta: {
    description: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogLocale: string | null;
    ogLocaleAlternates: string[];
    twitterTitle: string | null;
    twitterDescription: string | null;
  };
  images: ImageRecord[];
  sampledText: string;
  titleAndMetaText: string;
}

export interface HttpCheckResult {
  url: string;
  ok: boolean;
  status: number | null;
  redirected: boolean;
  finalUrl: string | null;
  error?: string;
}

export interface HttpResults {
  enabled: boolean;
  permissionGranted: boolean;
  checks: HttpCheckResult[];
}

export interface AuditContext {
  snapshot: PageSnapshot;
  http: HttpResults;
  settings: LocaleSentrySettings;
}

export interface AuditEvidence {
  expected?: string;
  found?: string;
  source?: string;
}

export interface AuditFinding {
  id: string;
  ruleId: string;
  title: string;
  category: RuleCategory;
  severity: Severity;
  passed: boolean;
  message: string;
  evidence?: AuditEvidence;
  selector?: string;
  locale?: string;
  url?: string;
}

export interface AuditRule {
  id: string;
  title: string;
  category: RuleCategory;
  defaultSeverity: Severity;
  run(context: AuditContext): AuditFinding[];
}

export interface AuditReport {
  version: 1;
  scannedAt: string;
  url: string;
  locale: string;
  localeLabel: string;
  score: number;
  scoreLabel: string;
  counts: {
    error: number;
    warning: number;
    review: number;
    info: number;
    passed: number;
  };
  findings: AuditFinding[];
  snapshot: PageSnapshot;
  http: HttpResults;
}

export const DEFAULT_SETTINGS: LocaleSentrySettings = {
  detectContentLanguage: true,
  checkRemoteUrls: false,
  highlightElements: true,
  includePassedRules: false,
};

export const SCORE_WEIGHTS: Record<Severity, number> = {
  error: 8,
  warning: 3,
  review: 1,
  info: 0,
  passed: 0,
};
