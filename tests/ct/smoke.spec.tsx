import { test, expect } from '@playwright/experimental-ct-react';

test('ct smoke mount', async ({ mount, page }) => {
  // Basic environment shim commonly needed in CT
  await page.addInitScript(() => {
    (window as any).process = (window as any).process || { env: {} };
  });

  const component = await mount(<div data-testid="ok">ok</div>);
  await expect(component.getByTestId('ok')).toBeVisible();
});


