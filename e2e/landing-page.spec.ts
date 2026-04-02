import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('renders hero section with CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('AI agents that run');
    await expect(page.locator('a[href="/signup"]').first()).toBeVisible();
  });

  test('nav links are visible on desktop', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="#features"]').first()).toBeVisible();
    await expect(page.locator('a[href="#pricing"]').first()).toBeVisible();
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });

  test('features section renders three layers', async ({ page }) => {
    await page.goto('/');
    await page.locator('#features').scrollIntoViewIfNeeded();
    await expect(page.locator('text=Three layers. One platform.')).toBeVisible();
    await expect(page.locator('text=Operations Automation')).toBeVisible();
    await expect(page.locator('text=Delivery Governance')).toBeVisible();
  });

  test('pricing section renders tiers', async ({ page }) => {
    await page.goto('/');
    await page.locator('#pricing').scrollIntoViewIfNeeded();
    await expect(page.locator('text=Free')).toBeVisible();
    await expect(page.locator('text=$49')).toBeVisible();
    await expect(page.locator('text=$149')).toBeVisible();
  });

  test('signup link navigates to signup page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/signup"]').first().click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('login link navigates to login page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/login"]').first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});
