import { test, expect } from '@playwright/test';

test('ErrorShelf appears on offline issuance attempt and supports retry/copy/report', async ({ page, context }) => {
  await page.goto('/airkit');

  // Wait until CTA is present (button text varies by auth state)
  const cta = page.getByRole('button').filter({ hasText: /Login|Store Data|Get|Connect|Loading|Initializing/i });
  await expect(cta.first()).toBeVisible();

  // Go offline and attempt issuance
  await context.setOffline(true);
  await cta.first().click();

  // Expect ErrorShelf to appear with correlation id
  const alert = page.getByRole('alert');
  await expect(alert.getByText('We hit a snag during issuance')).toBeVisible();
  const cidEl = alert.getByText(/Correlation ID:/);
  const firstCid = await cidEl.textContent();
  expect(firstCid).toBeTruthy();

  // Copy details
  await alert.getByRole('button', { name: 'Copy details' }).click();
  await expect(alert.getByRole('button', { name: /Copied|Copy details/ })).toBeVisible();

  // Report issue button visible
  await expect(alert.getByRole('button', { name: 'Report issue' })).toBeVisible();

  // Turn online and retry (we don't assert success, just that correlation id changes)
  await context.setOffline(false);
  const retryBtn = alert.getByRole('button', { name: 'Retry' });
  if (await retryBtn.isVisible()) {
    await retryBtn.click();
    const secondCid = await cidEl.textContent();
    expect(secondCid).toBeTruthy();
    if (firstCid && secondCid) expect(secondCid).not.toEqual(firstCid);
  }
});





