import { expect, test, chromium } from '@playwright/test';
import path from 'node:path';

const extensionPath = path.resolve('.output/chrome-mv3');

test('loads the unpacked extension launcher', async () => {
  const userDataDir = test.info().outputPath('user-data');
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    channel: 'chromium',
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });

  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popup.getByRole('button', { name: 'Scan this page' })).toBeVisible();
    await expect(popup.getByRole('button', { name: 'Open panel' })).toBeVisible();

    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await expect(panel.getByRole('heading', { name: 'No scan yet' })).toBeVisible();
  } finally {
    await context.close();
  }
});
