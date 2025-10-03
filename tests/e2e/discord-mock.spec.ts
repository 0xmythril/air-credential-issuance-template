import { test, expect } from '@playwright/test';
import { seedSessionCookie, mockUserData } from './support/session';

test('@mock discord mocked API flow renders preview', async ({ page }) => {
  await mockUserData(page, {
    user_type: 'discord',
    discord_id: '24680',
    username: 'discuser',
    discriminator: 1234,
    guilds_count: 3,
    owned_guilds_count: 1,
    connections_count: 2,
    verified: true,
    global_name: 'Disc User',
    locale: 'en',
    premium_type: 0,
    public_flags: 1,
  });

  // Stub NextAuth session to indicate authenticated
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { name: 'Disc User', username: 'discuser', discriminator: '1234' },
        accessToken: 'discord-oauth-access',
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      }),
    });
  });

  await seedSessionCookie(page, { discord: { accessToken: 'Bearer internal-discord', userName: 'Disc User' } });

  // Navigate and trigger
  await page.goto('/discord');
  await page.waitForRequest(req => req.url().includes('/api/user/user-data') && req.method() === 'POST');

  const firstCta = page.locator('button:has-text("Get My Discord Profile"), button:has-text("Store Data"), button:has-text("Sign in with Discord")');
  await expect(firstCta.first()).toBeVisible({ timeout: 15000 });
  await firstCta.first().click();

  // Assertions - key preview fields (disambiguated selectors)
  // Click CTA if present to trigger data fetch/display if needed
  const maybeCta = page.locator('button:has-text("Get My Discord Profile"), button:has-text("Store Data")');
  if (await maybeCta.first().isVisible({ timeout: 5000 }).catch(() => false)) {
    await maybeCta.first().click();
  }
  await expect(page.getByRole('heading', { name: /your discord profile/i })).toBeVisible({ timeout: 20000 });
  await expect(page.getByText(/servers joined|guilds/i).first()).toBeVisible();
});


