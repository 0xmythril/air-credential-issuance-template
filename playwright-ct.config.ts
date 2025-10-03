// playwright-ct.config.ts
import { defineConfig, devices } from '@playwright/experimental-ct-react';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  testDir: 'tests/ct',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ctPort: 0,            // let CT pick a free port
    trace: 'on-first-retry',
    viewport: { width: 800, height: 600 },
  },
  ctViteConfig: {
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, '.') } },
    define: { 'process.env': {} }, // avoid env access crashes in libs
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});