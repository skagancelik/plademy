import { test, expect } from '@playwright/test';

test.describe('Forms', () => {
  test('should submit contact form', async ({ page }) => {
    await page.goto('/en/contact');
    
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="message"]', 'Test message');
    
    // Mock the API call
    await page.route('**/api/form', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      });
    });

    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('#form-message')).toBeVisible();
  });

  test('should submit start form', async ({ page }) => {
    await page.goto('/en/start');
    
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="organization"]', 'Test Org');
    await page.fill('[name="needs"]', 'Test needs');
    
    // Mock the API call
    await page.route('**/api/form', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      });
    });

    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('#form-message')).toBeVisible();
  });
});

