# LocaleSentry

**Tagline:** Localization QA for the web

**One-line description:**  
LocaleSentry is an open-source browser extension that audits live webpages for localization, internationalization, multilingual SEO, and locale-specific implementation issues.

The primary users are frontend developers, QA engineers, localization engineers, SEO teams, agencies maintaining multilingual sites, and developers working with platforms such as WordPress/WPML, Shopify, Drupal, Next.js, Laravel, React, or static sites.

The extension’s purpose should remain focused:

> **Inspect the current webpage and identify localization/i18n implementation problems.**

That narrow purpose is also useful for browser-store compliance because the extension can keep permissions and functionality tightly scoped.

---

## 1. What LocaleSentry Does

Imagine opening:

```text
https://example.com/fr/products/widget/
```

and clicking the LocaleSentry icon.

Instead of merely reporting:

```text
hreflang: Found
lang: fr
```

LocaleSentry performs a structured audit:

```text
LocaleSentry

Localization Health
82 / 100

Current Locale
French — fr-FR

18 Passed
4 Warnings
2 Errors

────────────────────

Critical

✕ Canonical URL points to English page
  https://example.com/products/widget/

✕ German alternate returns HTTP 404
  hreflang="de"

Warnings

⚠ Missing x-default hreflang
⚠ og:locale is en_US
⚠ Two images have suspicious English alt text
⚠ Language switcher does not contain Japanese
```

Each result should be expandable.

Example:

```text
Canonical conflict

Expected:
https://example.com/fr/products/widget/

Found:
https://example.com/products/widget/

Source:
<link rel="canonical"
      href="https://example.com/products/widget/">

Severity:
Error
```

This makes LocaleSentry a QA and debugging tool rather than a basic SEO checker.

---

## 2. Main Audit Categories

LocaleSentry can be organized into seven major rule groups.

### Language declaration

Inspect:

```html
<html lang="fr">
```

Potential rules:

```text
HTML-LANG-001
Missing lang attribute

HTML-LANG-002
Empty lang attribute

HTML-LANG-003
Invalid or unknown language tag

HTML-LANG-004
Language declaration differs from detected content language

HTML-DIR-001
RTL language without dir="rtl"

HTML-DIR-002
LTR language unexpectedly using dir="rtl"
```

Example:

```html
<html lang="ar">
```

Potential warning:

```text
⚠ Arabic document does not declare dir="rtl"
```

This should generally be treated as a warning rather than an absolute error because framework and CSS behavior can vary.

---

## 3. hreflang Auditing

Suppose the page contains:

```html
<link rel="alternate"
      hreflang="en"
      href="https://example.com/product/">

<link rel="alternate"
      hreflang="fr"
      href="https://example.com/fr/product/">

<link rel="alternate"
      hreflang="de"
      href="https://example.com/de/product/">
```

LocaleSentry should understand these as one locale group.

Example UI:

```text
Language variants

✓ en
  https://example.com/product/

✓ fr
  https://example.com/fr/product/

✕ de
  https://example.com/de/product/
  HTTP 404

⚠ x-default
  Not declared
```

Suggested checks:

```text
HREFLANG-001  No hreflang alternates
HREFLANG-002  Invalid language code
HREFLANG-003  Duplicate locale
HREFLANG-004  Duplicate URL
HREFLANG-005  Missing self-reference
HREFLANG-006  Alternate URL is not HTTP 200
HREFLANG-007  Alternate points to redirected URL
HREFLANG-008  Alternate canonical conflicts
HREFLANG-009  Missing reciprocal hreflang
HREFLANG-010  Relative or invalid URL
HREFLANG-011  Incorrect region/language syntax
HREFLANG-012  Missing x-default
```

Missing `x-default` should normally be a recommendation or warning rather than a critical failure.

---

## 4. Canonical vs Localization

Consider:

```text
English
/example/product/

French
/fr/example/product/
```

but the French page contains:

```html
<link
  rel="canonical"
  href="https://example.com/example/product/">
```

LocaleSentry should flag:

```text
Canonical conflicts with localized page

Current:
https://example.com/fr/example/product/

Canonical:
https://example.com/example/product/

The French page canonicalizes to the English version.
```

Another scenario:

```text
fr → canonical → fr
de → canonical → en     ✕
es → canonical → es
ja → canonical → ja
```

LocaleSentry could visualize these locale relationships.

---

## 5. Locale Relationship View

This could become a signature feature.

Instead of presenting only a checklist, add a **Locales** view.

Example:

```text
             x-default
                 │
                 ▼
              English
             /   |    \
            /    |     \
           ▼     ▼      ▼
        French German Japanese
          ✓      ✕       ⚠
```

Or:

```text
Current page: fr-FR

Locale       URL                         Status
────────────────────────────────────────────────
en           /products/widget/           ✓ 200
fr           /fr/products/widget/        ✓ 200
de           /de/products/widget/        ✕ 404
es           /es/products/widget/        ✓ 200
ja           /ja/products/widget/        ↪ 301
x-default    /products/widget/           ✓ 200
```

Clicking a locale should expose its metadata and relevant relationships.

---

## 6. Metadata Localization

Inspect:

```html
<title>
<meta name="description">
<meta property="og:title">
<meta property="og:description">
<meta property="og:locale">
<meta property="og:locale:alternate">
<meta name="twitter:title">
<meta name="twitter:description">
```

Possible checks:

```text
META-001
Missing title

META-002
Missing meta description

META-003
og:locale doesn't match document locale

META-004
Localized page appears to use metadata from another language

META-005
Social metadata missing

META-006
Title identical across several locale variants
```

Avoid overclaiming when language detection is uncertain.

Prefer:

> This title is identical to the English variant. Review whether localization is intended.

instead of:

> Title is untranslated.

---

## 7. Image Localization

Basic check:

```html
<img src="hero.jpg">
```

Result:

```text
Missing alt attribute
```

LocaleSentry can also detect likely language mismatches.

Example:

```html
<img
  src="checkout.jpg"
  alt="Click here to complete your purchase">
```

on a French page.

Potential result:

```text
Possible language mismatch

Document:
French

Alt text:
Likely English

"Click here to complete your purchase"
```

This should be categorized as **Review**, not **Error**, because language detection is probabilistic.

---

## 8. Form Localization

Forms are commonly missed during localization QA.

Inspect:

```html
<input placeholder="Enter your email">
```

on a Japanese page.

Potential result:

```text
Form labels

⚠ Possible English placeholder on Japanese page

Email address:
"Enter your email"
```

Other elements worth checking:

```text
input placeholders
labels
button text
select options
validation messages present in DOM
aria-label
aria-description
title attributes
```

This intentionally overlaps with accessibility only where it affects localization.

LocaleSentry should not try to become a replacement for axe or Lighthouse.

---

## 9. Language Switcher Inspection

LocaleSentry can try to identify language switchers using:

```text
hreflang links
<nav>
<select>
links containing language codes
rel="alternate"
common accessibility labels
```

Example:

```text
Language Switcher

Detected

English       ✓
Français      ✓
Deutsch       ✓
Español       ✓
日本語         ✕

hreflang contains Japanese,
but language switcher does not.
```

This is exactly the sort of issue that commonly appears during manual QA.

---

## 10. URL Consistency

Analyze localized URL structures without enforcing one specific architecture.

Example:

```text
EN  /products/camtasia/
DE  /de/produkte/camtasia/
FR  /fr/products/camtasia/
ES  /es/products/camtasia/
```

This is not automatically wrong.

LocaleSentry should instead flag structural anomalies:

```text
Most locale URLs use:

/{locale}/{path}/

Japanese uses:

/products/{locale}/{path}/

Review URL structure.
```

This should usually be a **Review**, not an error.

---

## 11. Broken Localized Links

On a French page:

```html
<a href="/pricing/">
```

LocaleSentry may know:

```text
Current language: fr
```

and identify a likely French equivalent:

```text
/fr/pricing/
```

Potential result:

```text
Potential cross-locale link

Current page:
fr-FR

Link:
Pricing

Destination:
/pricing/

Destination locale:
en

Review whether this should point to:
/fr/pricing/
```

This is better suited to V2 because equivalence between localized URLs can be complex.

---

## 12. Page Scoring

Use a transparent score rather than an arbitrary metric.

Example:

```text
Locale Health

92
Excellent
```

Potential rule weights:

```text
Critical     -15
Error        -8
Warning      -3
Review       -1
Info          0
```

The UI should clearly explain which rules affected the score.

---

## 13. Severity System

Use four primary levels plus Passed.

### Error

Something is almost certainly incorrectly implemented.

```text
hreflang="de" returns 404
```

### Warning

Likely implementation problem.

```text
French page has an English canonical.
```

### Review

Potential issue requiring human judgment.

```text
Alt text appears to be English on a French page.
```

### Info

Useful implementation information.

```text
5 language variants detected.
```

### Passed

The check passed successfully.

---

## 14. Element Highlighting

For issues tied to DOM elements, allow the user to locate them on the page.

Example issue:

```text
Possible untranslated button

"Buy Now"
```

Action:

```text
Locate on page
```

The extension highlights:

```text
┌───────────────────────┐
│       Buy Now         │ ← highlighted
└───────────────────────┘
```

Then show developer details:

```text
DOM

<button class="buy-button">
    Buy Now
</button>

Selector

.product-hero .buy-button
```

This significantly improves the debugging workflow.

---

## 15. Inspector Interface

A side panel is likely better than relying only on a tiny popup.

Example:

```text
┌──────────────────────────────────┐
│ LocaleSentry                 ⚙   │
├──────────────────────────────────┤
│                                  │
│ Locale Health             88     │
│                                  │
│ Current locale                   │
│ 🇫🇷 French — fr-FR               │
│                                  │
├──────────────────────────────────┤
│ Overview | Issues | Locales      │
├──────────────────────────────────┤
│                                  │
│ Errors                        2  │
│                                  │
│ ✕ Canonical mismatch             │
│ ✕ German hreflang → 404          │
│                                  │
│ Warnings                      3  │
│                                  │
│ ⚠ Missing x-default              │
│ ⚠ og:locale mismatch             │
│ ⚠ English alt text               │
│                                  │
├──────────────────────────────────┤
│ Export Report        Scan Again  │
└──────────────────────────────────┘
```

Chrome and Firefox have different side-panel/sidebar APIs, so the UI shell should be abstracted if cross-browser support is planned.

---

## 16. Suggested Tabs

### Overview

```text
Health score
Current language
Detected locale count
Errors
Warnings
Passed tests
```

### Issues

Filters:

```text
All
Errors
Warnings
Review
Passed
```

### Locales

Language relationship matrix and locale-by-locale status.

### Raw

Developer-oriented data:

```text
HTML lang
dir
canonical
hreflang
Open Graph metadata
language switcher
HTTP responses
```

---

## 17. Reports

Reporting should be a core feature.

Support:

```text
Copy Markdown
Download JSON
Download CSV
```

Example Markdown export:

```markdown
# LocaleSentry Report

URL: https://example.com/fr/product/
Locale: fr-FR
Score: 82/100

## Errors

### Canonical locale mismatch

Canonical:
https://example.com/product/

Expected localized page:
https://example.com/fr/product/

### Broken hreflang

Locale: de
URL: https://example.com/de/product/
HTTP status: 404

## Warnings

- Missing x-default
- og:locale is en_US
```

This makes it easy to paste reports into GitHub, Jira, Linear, Slack, or a pull request.

---

## 18. GitHub Integration Later

A later version could support:

```text
Create GitHub Issue
```

and generate:

```text
Localization QA: /fr/product/

- [ ] Fix German hreflang
- [ ] Correct canonical
- [ ] Review og:locale
```

Do not include OAuth or GitHub API integration in V1.

Copying Markdown provides most of the value without the complexity.

---

## 19. Rule Engine

Avoid a monolithic scanner such as:

```ts
function scanPage() {
   // 2,000 lines
}
```

Instead, build individual audit rules.

Example:

```ts
export interface AuditRule {
    id: string;
    title: string;
    category: RuleCategory;
    defaultSeverity: Severity;

    run(context: AuditContext):
        Promise<AuditResult[]>;
}
```

Example implementation:

```ts
const htmlLangRule: AuditRule = {
    id: 'html-lang-present',

    title: 'Document language',

    category: 'language',

    defaultSeverity: 'error',

    async run(context) {
        const lang =
            context.document.documentElement.lang;

        if (!lang) {
            return [{
                passed: false,
                message:
                    'The document does not declare a language.'
            }];
        }

        return [{
            passed: true,
            message:
                `Document language is ${lang}.`
        }];
    }
};
```

Scanner:

```ts
for (const rule of rules) {
    results.push(
        ...await rule.run(context)
    );
}
```

This makes the project maintainable and extensible.

---

## 20. Rule IDs

Use stable public rule IDs.

Descriptive IDs are better than opaque numbering:

```text
html-lang-missing
html-lang-invalid
hreflang-invalid
hreflang-missing-self
hreflang-http-error
canonical-locale-conflict
og-locale-mismatch
rtl-dir-mismatch
possible-language-mismatch
```

Reports can then expose:

```text
Rule:
hreflang-http-error
```

This gives LocaleSentry a linter-like developer experience.

---

## 21. Architecture

```text
LocaleSentry
│
├── Extension UI
│   ├── popup
│   └── side panel
│
├── Content Scanner
│   │
│   ├── DOM collector
│   ├── metadata collector
│   ├── link collector
│   └── language detector
│
├── Audit Engine
│   │
│   └── Rules
│       ├── lang
│       ├── hreflang
│       ├── canonical
│       ├── metadata
│       ├── content
│       ├── rtl
│       └── accessibility/localization
│
├── Background Worker
│   │
│   └── HTTP validation
│
├── Report Engine
│   ├── Markdown
│   ├── CSV
│   └── JSON
│
└── Storage
    ├── settings
    └── scan history
```

---

## 22. Technology Stack

Recommended stack:

```text
TypeScript
React
Vite
Manifest V3
WebExtensions APIs
Vitest
Playwright
ESLint
Prettier
```

Optional:

```text
webextension-polyfill
```

The project should target Chrome first while keeping APIs abstracted enough to support Firefox later.

---

## 23. Permissions

Keep permissions conservative.

Potential Manifest V3 permissions:

```json
{
  "permissions": [
    "activeTab",
    "scripting",
    "storage"
  ]
}
```

This is preferable to broad permanent host access such as:

```json
"host_permissions": [
    "<all_urls>"
]
```

unless a future feature genuinely requires automatic or persistent site-wide scanning.

For V1, user-triggered page scanning is a better model.

---

## 24. Privacy

Make privacy a product feature.

Suggested positioning:

> **100% local. No account. No page data sent to LocaleSentry servers.**

The first version should analyze page content directly in the browser.

Suggested privacy statement:

```text
LocaleSentry does not collect,
store, sell, or transmit webpage
content or browsing history.

Scans are performed locally in
your browser.
```

This keeps the architecture simpler and makes store review easier.

---

## 25. Local Storage

Use extension storage for:

```text
settings
disabled rules
preferred severity
recent scan results
```

Example:

```ts
interface LocaleSentrySettings {
    detectContentLanguage: boolean;
    checkRemoteUrls: boolean;
    highlightElements: boolean;
    includePassedRules: boolean;
}
```

---

## 26. What Should Not Be in V1

Avoid:

```text
AI translations
Google Translate integration
accounts
cloud dashboard
team management
project management
full website crawler
CI/CD service
GitHub OAuth
Jira integration
automated translation
proxy service
SEO suite
accessibility suite
Lighthouse clone
```

Keeping V1 focused dramatically increases the chance of shipping it.

---

## 27. MVP

Ship approximately 15–20 rules.

### Language

```text
✓ HTML lang exists
✓ lang value valid
✓ RTL direction
```

### hreflang

```text
✓ hreflang syntax
✓ duplicate locales
✓ duplicate URLs
✓ self reference
✓ x-default
✓ URL reachability
```

### Canonical

```text
✓ canonical exists
✓ canonical doesn't conflict
```

### Metadata

```text
✓ title
✓ description
✓ og:locale
✓ og:locale:alternate
```

### Content

```text
✓ missing image alt
✓ suspicious localized text mismatch
```

### Reports

```text
✓ Markdown
✓ JSON
```

Also include:

```text
✓ highlight affected DOM element
```

This is enough for a legitimate 1.0 release.

---

## 28. V1.1

Potential additions:

```text
CSV export
scan history
rule configuration
dark mode
keyboard shortcuts
better language detection
```

---

## 29. V1.5

Add the locale matrix:

```text
English   French   German   Spanish   Japanese

✓         ✓        ✕        ✓         ⚠
```

Also add reciprocal page validation.

---

## 30. V2

Introduce **Site Scan**.

Instead of:

```text
Scan this page
```

offer:

```text
Scan Site
```

Example configuration:

```text
Start URL
https://example.com/

Maximum pages
25

Languages
Auto detect
```

Progress:

```text
Scanning...

12 / 25 pages
```

Example result:

| Page | EN | FR | DE | JA |
|---|---:|---:|---:|---:|
| Home | ✓ | ✓ | ✓ | ✓ |
| Pricing | ✓ | ✓ | ✕ | ✓ |
| About | ✓ | ⚠ | ✓ | ✓ |
| Contact | ✓ | ✓ | ✓ | ✕ |

At this point LocaleSentry becomes a more advanced localization QA tool.

---

## 31. V3 Possibility

Eventually split the architecture:

```text
@localesentry/core
@localesentry/rules
@localesentry/cli
@localesentry/browser
```

Then support CLI usage:

```bash
npx localesentry audit https://example.com
```

Example output:

```text
LocaleSentry 3.0

✓ Language declaration
✓ Canonical
✕ hreflang de → HTTP 404
⚠ Missing x-default

Score: 89/100
```

Potential CI integration:

```yaml
- run: npx localesentry audit https://staging.example.com
```

This evolves the project from a browser extension into a reusable localization QA engine.

---

## 32. Why This Works Well as a Portfolio Project

LocaleSentry demonstrates skills beyond WordPress:

```text
Browser APIs
TypeScript
React
DOM analysis
HTTP
Web standards
Extension security
Cross-browser compatibility
Testing
Rule-engine architecture
Data modeling
UX
Open-source project maintenance
```

Your WordPress experience can still help with testing against:

```text
WPML
Polylang
TranslatePress
WordPress Multisite
```

without making WordPress part of the architecture.

The same extension can work with:

```text
Next.js
Nuxt
Laravel
Drupal
Shopify
Magento
Webflow
static HTML
```

That separation is important for the portfolio story.

---

## 33. GitHub Positioning

Suggested repository structure:

```text
localesentry/
├── .github/
│   ├── workflows/
│   └── ISSUE_TEMPLATE/
│
├── src/
│   ├── background/
│   ├── content/
│   ├── popup/
│   ├── sidepanel/
│   ├── rules/
│   │   ├── language/
│   │   ├── hreflang/
│   │   ├── canonical/
│   │   ├── metadata/
│   │   └── content/
│   │
│   ├── scanner/
│   ├── reporters/
│   ├── storage/
│   ├── types/
│   └── utils/
│
├── tests/
│   ├── fixtures/
│   ├── rules/
│   └── e2e/
│
├── public/
│
├── manifest.json
├── package.json
├── README.md
├── CONTRIBUTING.md
├── PRIVACY.md
├── LICENSE
└── CHANGELOG.md
```

Potential license choices:

- MIT
- Apache-2.0
- GPL-3.0

For a general-purpose developer library and browser extension, MIT is a strong default if permissive reuse is desired.

---

## 34. Portfolio Presentation

Suggested project card:

### LocaleSentry

**Browser-based localization QA for developers.**

LocaleSentry audits live websites for internationalization and multilingual implementation problems, including `hreflang`, document languages, canonical relationships, locale metadata, RTL configuration, and localized content.

Suggested technology badges:

```text
TypeScript
React
WebExtensions
Manifest V3
Playwright
```

Suggested links:

```text
Chrome Web Store
GitHub
Documentation
```

This makes LocaleSentry a strong complement to WordPress themes and plugins because it demonstrates broader web engineering skills.

---

## Product Metadata

### Name

```text
LocaleSentry
```

### Tagline

```text
Localization QA for the web
```

### GitHub Repository

```text
localesentry
```

### GitHub Description

```text
Browser extension for auditing localization and internationalization issues on live websites.
```

Alternative:

```text
Open-source browser extension for detecting localization, i18n, hreflang, metadata, and multilingual implementation issues.
```

### GitHub Topics

```text
browser-extension
chrome-extension
firefox-extension
localization
internationalization
i18n
l10n
hreflang
seo
accessibility
qa
web-development
developer-tools
typescript
react
```

### Short Description

```text
Audit localization and internationalization issues directly in your browser.
```

### Long Description

LocaleSentry is an open-source browser extension for developers, QA engineers, and localization teams. It inspects live webpages for common multilingual implementation issues, including language attributes, hreflang relationships, canonical conflicts, metadata, missing alt text, RTL configuration, language switchers, and other localization-related problems.

### Chrome Web Store Name

```text
LocaleSentry
```

### Chrome Web Store Short Description

```text
Audit localization, hreflang, language metadata, and multilingual issues directly in your browser.
```

### Category

```text
Developer Tools
```

### Homepage

```text
https://github.com/rollybueno/localesentry
```

### Support URL

```text
https://github.com/rollybueno/localesentry/issues
```

---

## Suggested README Introduction

**LocaleSentry** is an open-source browser extension for auditing localization and internationalization issues directly on live websites. It helps developers and QA teams identify problems with language metadata, hreflang relationships, multilingual URLs, localized content, RTL configuration, accessibility-related text, and other common i18n implementation issues.

---

## Suggested Portfolio Copy

### LocaleSentry

A cross-platform browser extension for finding localization and internationalization issues on live websites, with structured QA reports and developer-friendly diagnostics.

---

## Future Package Naming

If the project later becomes a monorepo:

```text
@localesentry/core
@localesentry/rules
@localesentry/browser
@localesentry/cli
```

The main repository should remain:

```text
localesentry
```

---

## V1 Addendum (implementation lock)

This section is the shipping contract for LocaleSentry 1.0. Narrative sections above remain the product north star. Where they conflict with this addendum, **this addendum wins**.

### Stack

- **WXT** (Vite + Manifest V3) with TypeScript and React
- Chrome is the primary target; APIs stay Firefox-ready
- Vitest for rule tests, Playwright for one extension smoke path
- ESLint + Prettier

### UI shell

- **Side panel is the product.** Tabs: Overview, Issues, Locales, Raw. Export and Settings live in the panel.
- **Popup is a launcher only:** current locale, score, Scan, Open panel.
- Dark-first operate-mode developer tool. Dense and scannable. Not a second full UI in the popup.

### Architecture

```text
Collector (content script) → PageSnapshot → AuditEngine(rules) → AuditReport
                              ↘ optional HttpValidator (if permission granted)
```

Rules are pure functions over a serializable `PageSnapshot` plus optional HTTP results. They must not scrape the live DOM.

Snapshot V1 contents: `html[lang]`, `dir`, canonical, hreflang `<link>` tags, title/description/OG/Twitter, image alts, sampled visible text, page URL, and HTTP `Link` header alternates when the current origin can be fetched after a user-triggered scan.

Do **not** add `webRequest` in V1.

### Permissions

Required: `activeTab`, `scripting`, `storage`, `sidePanel`.

Optional (off by default): `*://*/*` for remote URL checks.

Enabling “Check remote URLs” requests the optional host permission, then validates hreflang/canonical reachability (200 / 3xx / 4xx). HTTP-dependent rules **skip** (do not fail) when remote checks are off, and may emit Info: “Remote URL checks are disabled.”

### Privacy

100% local. No account. No telemetry. No page content leaves the browser except user-initiated HEAD/GET to URLs already declared on the scanned page.

### Exports in V1

- Copy Markdown
- Download JSON
- Download CSV

### V1 rule IDs

Language: `html-lang-missing`, `html-lang-invalid`, `rtl-dir-mismatch`

hreflang: `hreflang-missing`, `hreflang-invalid`, `hreflang-duplicate-locale`, `hreflang-duplicate-url`, `hreflang-missing-self`, `hreflang-missing-x-default` (Warning), `hreflang-http-error` (remote checks on only)

Canonical: `canonical-missing` (Warning on multilingual pages, Info otherwise), `canonical-locale-conflict`

Metadata: `meta-title-missing`, `og-locale-mismatch`, `meta-language-mismatch` (Review, confidence-gated)

Content: `img-alt-missing`, `possible-language-mismatch` (Review, confidence-gated)

Language mismatch copy must never say “untranslated.” Prefer: “appears to match another language — review whether this is intended.” Below the detector confidence threshold, emit no finding.

Scoring: start at 100; Critical −15, Error −8, Warning −3, Review −1, Info 0; floor at 0.

### Explicitly deferred (not V1)

Language switcher heuristics, form localization, cross-locale link guessing, scan history, reciprocal hreflang, locale-relationship tree visualization, GitHub issue button, site crawler, accounts/cloud/AI, Firefox store listing (code should run; listing can wait), CLI package split.

License: MIT.
