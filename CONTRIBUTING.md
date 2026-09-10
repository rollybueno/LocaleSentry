# Contributing

LocaleSentry is a current-page localization QA extension. Keep that scope tight.

## Setup

Node 22+ is required (see `.nvmrc`).

```bash
nvm use
npm install
npm run dev
```

Load the unpacked extension from `.output/chrome-mv3-dev` while `npm run dev` is running.

## Scripts

- `npm run dev` — Chrome development build with HMR
- `npm run build` — production Chrome build
- `npm test` — Vitest rule and scanner tests
- `npm run test:e2e` — Playwright smoke (run `npm run build` first)
- `npm run lint` / `npm run format`

## Adding a rule

1. Create a file under `src/lib/rules/<category>/`.
2. Export an `AuditRule` with a stable public `id` (linter-style, for example `hreflang-missing-self`).
3. Run against `AuditContext` only (`PageSnapshot` + optional HTTP results). Do not scrape the live DOM.
4. Add a fixture and a Vitest file under `tests/rules/`.
5. Register the rule in `src/lib/rules/index.ts`.

Language mismatch findings must stay **Review**, and must never say “untranslated”.

## Permissions

Do not add broad required host permissions. Remote fetches belong behind the optional `*://*/*` permission.
