import { test, expect } from '@playwright/test';
import { seedSessionCookie, mockUserData } from './support/session';

// Minimal mocked E2E: navigate to /spotify, hit the CTA, ensure API flow and UI rendering
test('@mock spotify mocked API flow renders preview', async ({ page }) => {
  await mockUserData(page, {
    user_type: 'spotify',
    spotify_id: 'test_user_id',
    display_name: 'Test User',
    top_artists: [
      { name: 'Artist A', genres: ['pop'] },
      { name: 'Artist B', genres: ['rock'] },
    ],
    top_tracks: [
      { name: 'Track X', artists: ['Artist A'] },
    ],
    followed_artists: [],
    music_taste_summary: {
      total_top_artists: 2,
      total_top_tracks: 1,
      total_followed_artists: 0,
      top_genres: ['pop', 'rock'],
      music_diversity_score: 2,
    },
  });

  // Stub NextAuth session so spotify.isAuthenticated is true (avoid redirect)
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { name: 'Test User', email: 'test@example.com' },
        accessToken: 'spotify-oauth-access',
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      }),
    });
  });

  // Prevent any accidental Spotify API calls
  await page.route('https://api.spotify.com/**', route => route.fulfill({ status: 200, body: JSON.stringify({}) }));

  // Seed a fake session cookie so axios interceptor adds Authorization
  // Cookie name is from Zustand persist: "air.issuer-template.multi-session"
  await seedSessionCookie(page, { spotify: { accessToken: 'Bearer test-access-token', userName: 'Test User' } });

  // Navigate to /spotify to set auth method context and let useUserData fire
  await page.goto('/spotify');

  // Ensure the user-data call happened (and was intercepted)
  await page.waitForRequest(req => req.url().includes('/api/user/user-data') && req.method() === 'POST');

  // Click the primary CTA by its role and size class used in the component
  const cta = page.locator('button:has-text("Get My Music Data"), button:has-text("Store Data"), button:has-text("Sign in with Spotify")');
  await expect(cta.first()).toBeVisible({ timeout: 15000 });
  await cta.first().click();

  // Expect preview snippets to appear using mocked response
  await expect(page.getByText(/Artist A/)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Track X/)).toBeVisible({ timeout: 15000 });
});


