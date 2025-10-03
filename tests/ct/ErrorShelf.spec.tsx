import { test, expect } from '@playwright/experimental-ct-react';
import { ErrorShelf } from '@/components/common/ErrorShelf';

const mockError = {
  type: 'network',
  message: 'Failed to fetch',
  retryable: true,
  correlationId: 'test-123',
  code: 'NETWORK_ERROR',
  status: 0,
};

test('renders details, copy, report, and retry', async ({ mount, page }) => {
  let retried = 0;
  const component = await mount(
    <ErrorShelf
      error={mockError as any}
      onRetry={() => {
        retried += 1;
      }}
      supportEmail="support@example.com"
    />
  );

  await expect(component.getByText('Something went wrong')).toBeVisible();
  await expect(component.getByText('Failed to fetch')).toBeVisible();
  await expect(component.getByText('Correlation ID: test-123')).toBeVisible();

  await component.getByRole('button', { name: 'Retry' }).click();
  expect(retried).toBe(1);

  await component.getByRole('button', { name: 'Copy details' }).click();
  // Clipboard cannot be asserted directly in CT reliably; just ensure no error thrown.

  const report = component.getByRole('button', { name: 'Report issue' });
  await expect(report).toBeVisible();
});





