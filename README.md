# LocaleSentry

**Localization QA for the web**

LocaleSentry is an open-source browser extension that audits the current webpage for localization and internationalization issues: `lang`, `hreflang`, canonical conflicts, locale metadata, RTL direction, missing alt text, and likely language mismatches.

Scans run locally in your browser. There is no account and no LocaleSentry server.

## Install (Chrome, unpacked)

You need **Node 22+**. If you use nvm:

```bash
nvm use
```

Then:

```bash
npm install
npm run build
```

In Chrome:

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder: `.output/chrome-mv3`

Pin LocaleSentry from the puzzle-piece toolbar menu.

### Daily development

```bash
npm run dev
```

Load unpacked from `.output/chrome-mv3-dev` instead (hot reload). Leave that terminal running.

Firefox later: `npm run build:firefox` then load `.output/firefox-mv3` from `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on**.

## Test

Automated:

```bash
npm test              # Vitest: rules, collector, fixtures
npm run test:e2e      # builds the extension, then Playwright smoke
npm run lint
```

Manual (this is the real QA loop):

1. Load the unpacked build as above
2. Open a multilingual page (a WPML/Polylang site, a Next.js locale route, or Shopify)
3. Click the LocaleSentry icon → **Scan this page**
4. **Open panel** for Overview / Issues / Locales / Raw
5. Use **Locate on page** on a finding with a selector
6. Copy Markdown or download JSON/CSV
7. In Settings, optionally enable **Check remote URLs** (browser permission prompt) and scan again

Good first pages to try: a French URL whose canonical points at English, a page with no `lang`, or an Arabic page without `dir="rtl"`. There are static examples under `tests/fixtures/`.

## Use

1. Open a webpage
2. Click the LocaleSentry icon
3. **Scan this page**, or **Open panel** for the full report

The side panel has Overview, Issues, Locales, Raw, export (Markdown / JSON / CSV), and settings.

Remote URL checks are **off by default**. Enabling them asks for optional host permission so LocaleSentry can request hreflang and canonical URLs already declared on the page.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Chrome development build with HMR |
| `npm run build` | Production Chrome build |
| `npm run build:firefox` | Production Firefox build |
| `npm test` | Vitest rule and scanner tests |
| `npm run test:e2e` | Build the extension and run the Playwright smoke test |
| `npm run lint` | ESLint |

## Privacy

See [PRIVACY.md](PRIVACY.md). Page content is not sent to LocaleSentry. Optional remote checks only contact URLs listed on the scanned page.

## License

MIT. See [LICENSE](LICENSE).
