import { test, expect } from '@playwright/test';
import { seedSessionCookie, mockUserData } from './support/session';

test('@mock twitter mocked API flow renders preview', async ({ page }) => {
  await mockUserData(page, {
    user_type: 'twitter',
    twitter_id: '12345',
    username: 'testuser',
    name: 'Test User',
    followers_count: 42,
    following_count: 7,
    tweet_count: 100,
    listed_count: 2,
    verified: true,
    description: 'Bio lorem ipsum',
    location: 'Internet',
    account_created_at: '2020-01-01T00:00:00.000Z',
  });

  // Stub NextAuth session to indicate authenticated
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { name: 'Test User', username: 'testuser' },
        accessToken: 'twitter-oauth-access',
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      }),
    });
  });

  await seedSessionCookie(page, { twitter: { accessToken: 'Bearer internal-twitter', userName: 'Test User' } });

  // Navigate and trigger
  await page.goto('/twitter');
  await page.waitForRequest(req => req.url().includes('/api/user/user-data') && req.method() === 'POST');

  const cta = page.locator('button:has-text("Get My Profile Data"), button:has-text("Store Data"), button:has-text("Sign in with Twitter")');
  await expect(cta.first()).toBeVisible({ timeout: 15000 });
  await cta.first().click();

  // Assertions - key preview fields
  await expect(page.getByText(/@testuser/)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Followers:/)).toBeVisible();
});


