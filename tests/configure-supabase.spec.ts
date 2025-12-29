import { test, expect } from '@playwright/test';

test('configure Supabase URL settings', async ({ page }) => {
  // Acessar a pagina de login do Supabase
  await page.goto('https://supabase.com/dashboard/sign-in');
  await page.waitForLoadState('networkidle');

  // Fazer login
  await page.fill('input[name="email"]', 'contato.luizhms@gmail.com');
  await page.fill('input[name="password"]', 'Luiz200k');
  await page.click('button:has-text("Sign in")');

  // Aguardar redirecionamento
  await page.waitForTimeout(5000);

  // Tirar screenshot apos login
  await page.screenshot({ path: 'supabase-after-login.png', fullPage: true });
  console.log('URL apos login:', page.url());

  // Navegar para a pagina de configuracao de URL
  await page.goto('https://supabase.com/dashboard/project/qhjlxnzxazcqrkgojnbx/auth/url-configuration');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Tirar screenshot da pagina de configuracao
  await page.screenshot({ path: 'supabase-url-config-page.png', fullPage: true });
  console.log('URL da pagina de config:', page.url());
});
