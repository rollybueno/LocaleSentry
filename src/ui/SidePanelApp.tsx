import { useEffect, useMemo, useState } from 'react';
import { reportToCsv, reportToJson, reportToMarkdown } from '../lib/reporters';
import { DEFAULT_SETTINGS, type AuditFinding, type AuditReport, type LocaleSentrySettings, type Severity } from '../lib/types';
import { downloadFile, reportBasename, send, type SettingsResponse } from './bridge';
import { visibleFindings } from './findings';
import { useScan } from './useScan';

type Tab = 'overview' | 'issues' | 'locales' | 'raw' | 'settings';

export function SidePanelApp() {
  const { report, error, scanning, scan } = useScan();
  const [tab, setTab] = useState<Tab>('overview');
  const [copied, setCopied] = useState(false);

  return (
    <div className="app">
      <header className="masthead">
        <div className="wordmark">
          <strong>LocaleSentry</strong>
          <span>Current page audit</span>
        </div>
        <div className="masthead-actions">
          <button type="button" onClick={() => setTab('settings')} aria-pressed={tab === 'settings'}>
            Settings
          </button>
          <button className="btn-primary" type="button" onClick={() => void scan()} disabled={scanning}>
            {scanning ? 'Scanning…' : 'Scan'}
          </button>
        </div>
      </header>

      <nav className="tabs" aria-label="Report sections">
        {(['overview', 'issues', 'locales', 'raw'] as const).map((id) => (
          <button
            key={id}
            className="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >
            {id.slice(0, 1).toUpperCase() + id.slice(1)}
          </button>
        ))}
      </nav>

      <main className="panel-body">
        {error ? <div className="banner banner-error">{error}</div> : null}
        {!report && !error ? (
          <div className="empty">
            <h2>No scan yet</h2>
            <p>
              Scan the current tab to check language tags, hreflang, canonical URLs, metadata, and
              image text.
            </p>
          </div>
        ) : null}
        {report && tab === 'overview' ? <Overview report={report} /> : null}
        {report && tab === 'issues' ? <Issues report={report} /> : null}
        {report && tab === 'locales' ? <Locales report={report} /> : null}
        {report && tab === 'raw' ? <Raw report={report} /> : null}
        {tab === 'settings' ? <SettingsForm /> : null}
      </main>

      {report ? (
        <footer className="footer">
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(reportToMarkdown(report));
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            }}
          >
            {copied ? 'Copied Markdown' : 'Copy Markdown'}
          </button>
          <button
            type="button"
            onClick={() =>
              downloadFile(`${reportBasename(report)}.json`, reportToJson(report), 'application/json')
            }
          >
            Download JSON
          </button>
          <button
            type="button"
            onClick={() =>
              downloadFile(`${reportBasename(report)}.csv`, reportToCsv(report), 'text/csv')
            }
          >
            Download CSV
          </button>
        </footer>
      ) : null}
    </div>
  );
}

function Overview({ report }: { report: AuditReport }) {
  const top = report.findings.filter((item) => !item.passed && item.severity === 'error').slice(0, 5);
  return (
    <>
      <div className="stamp">
        <div className="stamp-score" aria-label={`Score ${report.score} out of 100`}>
          {report.score}
        </div>
        <dl>
          <dt>Health</dt>
          <dd>
            {report.scoreLabel} / 100
          </dd>
          <dt>Locale</dt>
          <dd>{report.localeLabel}</dd>
        </dl>
      </div>
      <table className="ledger">
        <tbody>
          <tr>
            <th>URL</th>
            <td className="mono">{report.url}</td>
          </tr>
          <tr>
            <th>Errors</th>
            <td>{report.counts.error}</td>
          </tr>
          <tr>
            <th>Warnings</th>
            <td>{report.counts.warning}</td>
          </tr>
          <tr>
            <th>Review</th>
            <td>{report.counts.review}</td>
          </tr>
          <tr>
            <th>Passed</th>
            <td>{report.counts.passed}</td>
          </tr>
        </tbody>
      </table>
      {top.length ? (
        <div className="stack">
          <h2>Top errors</h2>
          {top.map((item) => (
            <p key={item.id}>
              <span className="sev sev-error">Error</span> {item.message}
            </p>
          ))}
        </div>
      ) : (
        <p>No errors. Remaining findings, if any, are warnings or review items.</p>
      )}
    </>
  );
}

function Issues({ report }: { report: AuditReport }) {
  const [filter, setFilter] = useState<Severity | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [includePassed, setIncludePassed] = useState(false);

  useEffect(() => {
    void send<SettingsResponse>({ type: 'GET_SETTINGS' }).then((response) => {
      setIncludePassed(Boolean(response.settings?.includePassedRules));
    });
  }, []);

  const items = useMemo(
    () => visibleFindings(report.findings, filter, includePassed),
    [report.findings, filter, includePassed],
  );

  return (
    <>
      <div className="filters" aria-label="Filter findings">
        {(['all', 'error', 'warning', 'review', 'info', 'passed'] as const)
          .filter((id) => id !== 'passed' || includePassed)
          .map((id) => (
          <button
            key={id}
            className="filter"
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
            {id === 'all' ? 'All' : id.slice(0, 1).toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>
      {items.length === 0 ? <p>No findings in this filter.</p> : null}
      <div className="issue-list">
        {items.map((item) => (
          <IssueRow
            key={item.id}
            finding={item}
            open={openId === item.id}
            onToggle={() => setOpenId(openId === item.id ? null : item.id)}
          />
        ))}
      </div>
    </>
  );
}

function IssueRow({
  finding,
  open,
  onToggle,
}: {
  finding: AuditFinding;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button className="issue" type="button" onClick={onToggle} aria-expanded={open}>
        <div className="issue-head">
          <strong>{finding.title}</strong>
          <span className={`sev sev-${finding.severity}`}>{finding.severity}</span>
        </div>
        <p>{finding.message}</p>
        <code>{finding.ruleId}</code>
      </button>
      {open ? (
        <div className="evidence">
          {finding.evidence?.expected ? <div>Expected: {finding.evidence.expected}</div> : null}
          {finding.evidence?.found ? <div>Found: {finding.evidence.found}</div> : null}
          {finding.evidence?.source ? <pre>{finding.evidence.source}</pre> : null}
          {finding.url ? <div className="mono">{finding.url}</div> : null}
          {finding.selector ? (
            <button
              type="button"
              onClick={() => void send({ type: 'HIGHLIGHT', selector: finding.selector! })}
            >
              Locate on page
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Locales({ report }: { report: AuditReport }) {
  const rows = report.snapshot.hreflang;
  if (!rows.length) {
    return <p>No hreflang variants were declared on this page.</p>;
  }
  return (
    <table className="locales">
      <thead>
        <tr>
          <th>Locale</th>
          <th>URL</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const check = report.http.checks.find((item) => item.url === row.href);
          const status = !report.http.enabled
            ? 'unchecked'
            : check?.redirected
              ? 'redirect'
              : check?.ok
                ? 'ok'
                : 'bad';
          const label = !report.http.enabled
            ? 'unchecked'
            : check?.redirected
              ? String(check.status ?? 'redirect')
              : check
                ? String(check.status ?? check.error ?? 'failed')
                : 'unchecked';
          return (
            <tr key={`${row.hreflang}:${row.href}:${row.source}`}>
              <td>{row.hreflang}</td>
              <td className="mono">{row.href}</td>
              <td className={`status-${status}`}>{label}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Raw({ report }: { report: AuditReport }) {
  const { snapshot } = report;
  return (
    <div className="raw">
      <h2>Document</h2>
      <pre>{`lang: ${snapshot.htmlLang || '(missing)'}
dir: ${snapshot.dir || '(missing)'}
canonical: ${snapshot.canonical || '(missing)'}
title: ${snapshot.title || '(missing)'}`}</pre>
      <h2>hreflang</h2>
      <pre>
        {snapshot.hreflang.length
          ? snapshot.hreflang.map((item) => `${item.hreflang} ${item.href} (${item.source})`).join('\n')
          : '(none)'}
      </pre>
      <h2>Open Graph</h2>
      <pre>{`og:locale: ${snapshot.meta.ogLocale || '(missing)'}
og:title: ${snapshot.meta.ogTitle || '(missing)'}
og:description: ${snapshot.meta.ogDescription || '(missing)'}
og:locale:alternate: ${snapshot.meta.ogLocaleAlternates.join(', ') || '(none)'}`}</pre>
    </div>
  );
}

function SettingsForm() {
  const [settings, setSettings] = useState<LocaleSentrySettings>(DEFAULT_SETTINGS);
  const [hasPermission, setHasPermission] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    void send<SettingsResponse>({ type: 'GET_SETTINGS' }).then((response) => {
      if (response.settings) setSettings(response.settings);
      setHasPermission(Boolean(response.hasHostPermission));
    });
  }, []);

  async function update(patch: Partial<LocaleSentrySettings>) {
    if (patch.checkRemoteUrls === true) {
      const response = await send<SettingsResponse>({ type: 'REQUEST_HOST_PERMISSION' });
      setHasPermission(Boolean(response.hasHostPermission));
      if (response.settings) setSettings(response.settings);
      if (!response.granted) {
        setNote('Remote checks need optional host permission. The browser prompt was dismissed.');
        return;
      }
      setNote('Remote URL checks are on. Alternate and canonical URLs will be requested on the next scan.');
      return;
    }
    const response = await send<SettingsResponse>({ type: 'SET_SETTINGS', settings: patch });
    if (response.settings) setSettings(response.settings);
    setHasPermission(Boolean(response.hasHostPermission));
    setNote(null);
  }

  return (
    <form className="stack" onSubmit={(event) => event.preventDefault()}>
      <label className="setting">
        <input
          type="checkbox"
          checked={settings.detectContentLanguage}
          onChange={(event) => void update({ detectContentLanguage: event.target.checked })}
        />
        <span>Detect content language locally and raise review findings when it looks mismatched.</span>
      </label>
      <label className="setting">
        <input
          type="checkbox"
          checked={settings.checkRemoteUrls && hasPermission}
          onChange={(event) => void update({ checkRemoteUrls: event.target.checked })}
        />
        <span>
          Check remote URLs. Off by default. When on, LocaleSentry requests permission and fetches
          hreflang and canonical URLs already declared on the page.
        </span>
      </label>
      <label className="setting">
        <input
          type="checkbox"
          checked={settings.highlightElements}
          onChange={(event) => void update({ highlightElements: event.target.checked })}
        />
        <span>Allow Locate on page to draw a highlight overlay.</span>
      </label>
      <label className="setting">
        <input
          type="checkbox"
          checked={settings.includePassedRules}
          onChange={(event) => void update({ includePassedRules: event.target.checked })}
        />
        <span>Include passed rules in copied reports (JSON always includes them).</span>
      </label>
      {note ? <div className="banner">{note}</div> : null}
    </form>
  );
}
