import { test, expect } from '@playwright/test';

test('UI Refinement Verification', async ({ page }) => {
  await page.goto('http://localhost:3000/hero-verify');

  // Wait for animations
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: 'v9-uma-refinements.png', fullPage: true });

  // Verify Last Updated text
  const lastUpdated = page.locator('div:has-text("Actualizado el")');
  await expect(lastUpdated).toHaveClass(/text-\[11px\]/);
  await expect(lastUpdated).toHaveClass(/rounded-full/);

  // Verify RankingSearch exists
  const searchInput = page.locator('input[placeholder*="BUSCAR JUGADOR"]');
  await expect(searchInput).toBeVisible();

  // Verify TabsTrigger
  const tabsTrigger = page.locator('button:has-text("Ranking Individual")');
  await expect(tabsTrigger).toHaveClass(/text-\[11px\]/);
  await expect(tabsTrigger).toHaveClass(/tracking-\[0.2em\]/);

  // Verify EmptyState secondary button
  const secondaryButton = page.locator('a:has-text("Ver ranking global")').locator('..');
  // Check height class h-14
  await expect(secondaryButton).toHaveClass(/h-14/);
  await expect(secondaryButton).toHaveClass(/text-\[11px\]/);
});
