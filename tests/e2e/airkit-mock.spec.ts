import { test, expect } from '@playwright/test';
import { seedSessionCookie, mockUserData } from './support/session';

test('@mock airkit mocked flow renders generic data', async ({ page }) => {
  await mockUserData(page, { user_type: 'airkit', some_field: 'some value', another_field: 123 });

  // Seed internal session cookie for airkit
  await seedSessionCookie(page, { airkit: { accessToken: 'Bearer internal-airkit', userName: 'AirKit User' } });

  // Stub airkit auth endpoint in case the flow triggers it
  await page.route('**/api/auth/airkit', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: 'Bearer internal-airkit-2', walletAddress: '0x0' }),
    });
  });

  // Navigate and trigger
  await page.goto('/airkit');
  // Click CTA to force fetch/refetch path regardless of initial state
  const cta = page.locator('button:has-text("Store Data"), button:has-text("Login")');
  await expect(cta.first()).toBeVisible({ timeout: 15000 });
  await cta.first().click();

  // Ensure the user-data call occurred
  await page.waitForRequest(req => req.url().includes('/api/user/user-data') && req.method() === 'POST');

  // Assertions - check values rather than raw keys (formatting may change keys)
  await expect(page.getByText(/some value/i)).toBeVisible({ timeout: 20000 });
  await expect(page.getByText(/123/)).toBeVisible();
});


