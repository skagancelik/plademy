import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test('should display search page', async ({ page }) => {
    await page.goto('/en/search');
    await expect(page.locator('h1')).toContainText('Search');
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
  });

  test('should show no results initially', async ({ page }) => {
    await page.goto('/en/search');
    await expect(page.locator('[data-testid="search-results"]')).toContainText('No results');
  });
});

