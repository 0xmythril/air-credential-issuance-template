import { Page } from '@playwright/test';

type SessionName = 'spotify' | 'twitter' | 'discord' | 'wallet' | 'airkit';

export async function seedSessionCookie(page: Page, session: Partial<Record<SessionName, { accessToken: string | null; userName?: string }>>) {
  const base = new URL(process.env.APP_URL || 'http://127.0.0.1:3000');
  const cookieValue = JSON.stringify({
    state: {
      sessions: {
        spotify: { accessToken: null, ...(session.spotify || {}) },
        twitter: { accessToken: null, ...(session.twitter || {}) },
        discord: { accessToken: null, ...(session.discord || {}) },
        wallet: { accessToken: null, ...(session.wallet || {}) },
        airkit: { accessToken: null, ...(session.airkit || {}) },
      },
      accessToken: null,
      version: 0,
    },
    version: 0,
  });
  await page.context().addCookies([
    {
      name: 'air.issuer-template.multi-session',
      value: cookieValue,
      url: base.origin,
      httpOnly: false,
      sameSite: 'Lax',
    },
  ]);
}

export async function mockUserData(page: Page, response: unknown, status = 200) {
  await page.route('**/api/user/user-data', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ jwt: 'test-jwt', response }),
      });
      return;
    }
    await route.fallback();
  });
}


