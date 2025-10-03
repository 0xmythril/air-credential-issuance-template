import { test, expect } from '@playwright/test';

test('Explore page loads and shows header', async ({ page }) => {
  await page.goto('/explore');
  await expect(page).toHaveTitle(/.+/);
  await expect(page.getByRole('heading', { name: 'Explore Credentials' })).toBeVisible();
});





