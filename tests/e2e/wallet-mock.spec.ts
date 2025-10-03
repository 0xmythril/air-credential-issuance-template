import { test, expect } from '@playwright/test';
import { seedSessionCookie, mockUserData } from './support/session';

test('@mock wallet/ethos mocked API flow renders preview', async ({ page }) => {
  await mockUserData(page, {
    address: '0x1234567890123456789012345678901234567890',
    score: 88,
    level: 'gold',
    is_test_address: false,
  });

  await seedSessionCookie(page, { wallet: { accessToken: 'Bearer internal-wallet', userName: 'Wallet User' } });

  // Navigate and trigger
  await page.goto('/ethos');
  await page.waitForRequest(req => req.url().includes('/api/user/user-data') && req.method() === 'POST');

  const cta = page.locator('button:has-text("Connect Wallet"), button:has-text("Store Data")');
  await expect(cta.first()).toBeVisible({ timeout: 15000 });
  await cta.first().click();

  // Assertions - wallet preview renders score and level
  await expect(page.getByText(/address/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/score/i)).toBeVisible();
  await expect(page.getByText(/level/i)).toBeVisible();
});


