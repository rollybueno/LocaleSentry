import { useScan } from './useScan';
import { send } from './bridge';

export function PopupApp() {
  const { report, error, scanning, scan } = useScan();

  return (
    <div className="app popup">
      <header className="masthead">
        <div className="wordmark">
          <strong>LocaleSentry</strong>
          <span>Localization QA</span>
        </div>
      </header>
      <main className="panel-body">
        {error ? <div className="banner banner-error">{error}</div> : null}
        {report ? (
          <div className="stamp">
            <div className="stamp-score" aria-label={`Score ${report.score} out of 100`}>
              {report.score}
            </div>
            <dl>
              <dt>Locale</dt>
              <dd>{report.localeLabel}</dd>
              <dt>Status</dt>
              <dd>
                {report.counts.error} errors · {report.counts.warning} warnings
              </dd>
            </dl>
          </div>
        ) : (
          <div className="empty">
            <h2>Scan this page</h2>
            <p>
              Inspect language, hreflang, canonical, metadata, and localized content on the current
              tab.
            </p>
          </div>
        )}
        <div className="stack">
          <button className="btn-primary" type="button" onClick={() => void scan()} disabled={scanning}>
            {scanning ? 'Scanning…' : 'Scan this page'}
          </button>
          <button type="button" onClick={() => void send({ type: 'OPEN_SIDEPANEL' })}>
            Open panel
          </button>
        </div>
      </main>
    </div>
  );
}
