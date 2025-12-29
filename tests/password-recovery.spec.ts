import { test, expect } from '@playwright/test';

test.describe('Password Recovery Flow', () => {
  test('should show forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');

    // Check page loaded correctly
    await expect(page.locator('text=Esqueceu sua senha?')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Enviar link de recuperacao")')).toBeVisible();
  });

  test('should have forgot password link on login page', async ({ page }) => {
    await page.goto('/login');

    // Check link exists
    const forgotLink = page.locator('a[href="/forgot-password"]');
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveText('Esqueceu a senha?');

    // Click and verify navigation
    await forgotLink.click();
    await expect(page).toHaveURL('/forgot-password');
  });

  test('should send recovery email', async ({ page }) => {
    await page.goto('/forgot-password');

    // Fill email
    await page.fill('input[type="email"]', 'contato.luizhms@gmail.com');

    // Click submit
    await page.click('button:has-text("Enviar link de recuperacao")');

    // Wait for success state (email sent confirmation)
    await expect(page.locator('text=Verifique seu email')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=contato.luizhms@gmail.com')).toBeVisible();
  });

  test('should show reset password page with loading state', async ({ page }) => {
    await page.goto('/reset-password');

    // Should show verifying state first, then error (no session)
    // Wait for either verifying or error state
    await page.waitForTimeout(2000);

    // Should show error since there's no valid recovery session
    await expect(page.locator('text=Link invalido').or(page.locator('text=Verificando'))).toBeVisible();
  });

  test('should show error when accessing reset-password without session', async ({ page }) => {
    await page.goto('/reset-password');

    // Wait for verification to complete
    await page.waitForTimeout(3000);

    // Should show invalid link error
    await expect(page.locator('text=Link invalido')).toBeVisible();
    await expect(page.locator('text=Solicitar novo link')).toBeVisible();
  });
});
