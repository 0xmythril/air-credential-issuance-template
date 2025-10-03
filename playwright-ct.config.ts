import { defineConfig, devices } from '@playwright/experimental-ct-react';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  testDir: 'tests/ct',
  snapshotDir: 'tests/ct/__snapshots__',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    ctPort: 3100,
    viewport: { width: 800, height: 600 },
  },
  ctViteConfig: {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
