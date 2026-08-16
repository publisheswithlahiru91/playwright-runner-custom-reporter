import { test, expect } from '@playwright/test';

test.describe('TDD-LM Reporter demo @smoke', () => {
  test('passes with test steps @functional', async ({ page }) => {
    await test.step('Open example.com', async () => {
      await page.goto('https://example.com');
    });

    await test.step('Verify heading', async () => {
      await expect(page.getByRole('heading', { name: 'Example Domain' })).toBeVisible();
    });
  });

  test('demonstrates failure details @regression', async ({ page }) => {
    await test.step('Navigate to example.com', async () => {
      await page.goto('https://example.com');
    });

    await test.step('Intentional assertion failure', async () => {
      await expect(page.getByRole('heading', { name: 'Does Not Exist' })).toBeVisible({
        timeout: 2000,
      });
    });
  });
});
