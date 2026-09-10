# Privacy

LocaleSentry does not collect, store, sell, or transmit webpage content or browsing history to LocaleSentry servers.

There is no account, no analytics, and no telemetry.

## What runs locally

Scans run in your browser. The extension reads the current page after you click Scan, evaluates localization rules locally, and keeps settings in browser extension storage on your device.

## Optional remote URL checks

Remote URL checks are **off by default**.

If you enable **Check remote URLs**, LocaleSentry requests optional host permission and may send HTTP `HEAD` or `GET` requests to URLs already declared on the scanned page (hreflang alternates and the canonical URL). Those requests go to the sites you are auditing, not to LocaleSentry.

You can turn this off at any time. HTTP-dependent rules then skip instead of failing.
