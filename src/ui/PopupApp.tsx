import { useState } from 'react';
import { openSidePanelFromUi } from './openPanel';
import { useScan } from './useScan';

export function PopupApp() {
  const { report, error, scanning, scan, setError } = useScan();
  const [openingPanel, setOpeningPanel] = useState(false);

  function openPanel() {
    setOpeningPanel(true);
    setError(null);
    openSidePanelFromUi((openError) => {
      if (openError) {
        setError(openError);
        setOpeningPanel(false);
        return;
      }
      window.close();
    });
  }

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
          <button type="button" onClick={openPanel} disabled={openingPanel}>
            {openingPanel ? 'Opening…' : 'Open panel'}
          </button>
        </div>
      </main>
    </div>
  );
}
