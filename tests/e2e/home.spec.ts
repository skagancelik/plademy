import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load home page in English', async ({ page }) => {
    await page.goto('/en/');
    await expect(page).toHaveTitle(/Plademy/);
    await expect(page.locator('h1')).toContainText('Transform Your Organization');
  });

  test('should switch language to Finnish', async ({ page }) => {
    await page.goto('/en/');
    await page.click('text=Suomi');
    await expect(page).toHaveURL(/\/fi\//);
  });

  test('should navigate to programs', async ({ page }) => {
    await page.goto('/en/');
    await page.click('text=Programs');
    await expect(page).toHaveURL(/\/en\/programs/);
  });

  test('should navigate to resources', async ({ page }) => {
    await page.goto('/en/');
    await page.click('text=Resources');
    await expect(page).toHaveURL(/\/en\/resources/);
  });
});

