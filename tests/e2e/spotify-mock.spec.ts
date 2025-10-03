import { test, expect } from '@playwright/test';

// Minimal mocked E2E: navigate to /spotify, hit the CTA, ensure API flow and UI rendering
test('@mock spotify mocked API flow renders preview', async ({ page }) => {
  // Intercept user-data API and fulfill a deterministic payload
  await page.route('**/api/user/user-data', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jwt: 'test-jwt',
          response: {
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
          },
        }),
      });
      return;
    }
    await route.fallback();
  });

  // Seed a fake session cookie so axios interceptor adds Authorization
  // Cookie name is from Zustand persist: "air.issuer-template.multi-session"
  const cookieValue = encodeURIComponent(JSON.stringify({
    state: {
      // minimal multi-session store shape
      sessions: {
        spotify: { accessToken: 'Bearer test-access-token', userName: 'Test User' },
        twitter: { accessToken: null },
        discord: { accessToken: null },
        wallet: { accessToken: null },
        airkit: { accessToken: null },
      },
      accessToken: null,
      version: 0,
    },
    version: 0,
  }));

  await page.context().addCookies([
    {
      name: 'air.issuer-template.multi-session',
      value: cookieValue,
      url: process.env.APP_URL || 'http://127.0.0.1:3000',
      path: '/',
      httpOnly: false,
    },
  ]);

  // Navigate to /spotify to set auth method context
  await page.goto('/spotify');

  // Wait for main CTA button and click it
  const cta = page.getByRole('button');
  await expect(cta).toBeVisible();
  await cta.click();

  // Expect preview snippets to appear using mocked response
  await expect(page.getByText(/Artist A/)).toBeVisible();
  await expect(page.getByText(/Track X/)).toBeVisible();
});


