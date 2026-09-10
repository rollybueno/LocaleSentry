import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  use: {
    headless: true,
  },
  webServer: {
    command: 'python3 -m http.server 4177 --bind 127.0.0.1 --directory tests/fixtures',
    port: 4177,
    reuseExistingServer: !process.env.CI,
  },
});
