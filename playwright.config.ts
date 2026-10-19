import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', timeout: 30000, fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:3006', viewport: { width: 1440, height: 1000 }, timezoneId: 'Europe/Budapest', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: [
    { command: 'npm run dev:review', url: 'http://127.0.0.1:3006', reuseExistingServer: true },
    { command: 'npm run preview', url: 'http://127.0.0.1:3007', reuseExistingServer: true },
    { command: 'npm run preview:team-review', url: 'http://127.0.0.1:3008', reuseExistingServer: true },
  ],
});
