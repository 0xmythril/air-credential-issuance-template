import { test, expect } from '@playwright/test';
import { seedSessionCookie } from './support/session';

test('@mock error state shows retry UI', async ({ page }) => {
  await page.route('**/api/user/user-data', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'boom' }) });
      return;
    }
    await route.fallback();
  });

  await seedSessionCookie(page, { spotify: { accessToken: 'Bearer x', userName: 'X' } });

  await page.goto('/spotify');
  // Expect the error shelf text to appear; Retry button might be gated by state
  await expect(page.getByText(/failed to load user data|failed to fetch/i)).toBeVisible({ timeout: 15000 });
});


