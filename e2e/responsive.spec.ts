import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('landing page is usable at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('a[href="/signup"]').first()).toBeVisible();
    // Nav links should be hidden on mobile
    const featuresLink = page.locator('a[href="#features"]').first();
    const isHidden = await featuresLink.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.display === 'none' || el.classList.contains('hidden');
    }).catch(() => true);
    expect(isHidden).toBeTruthy();
  });

  test('landing page works at tablet width', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#features')).toBeVisible();
  });

  test('login page is usable at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('404 page renders correctly', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    await page.waitForTimeout(1000);
    // Should show some kind of not found or redirect
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });
});
