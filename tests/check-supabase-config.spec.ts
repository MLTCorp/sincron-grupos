import { test, expect } from '@playwright/test';

test('check Supabase URL configuration', async ({ page }) => {
  // Acessar a pagina de configuracao de URL do Supabase
  await page.goto('https://supabase.com/dashboard/project/qhjlxnzxazcqrkgojnbx/auth/url-configuration');

  // Tirar screenshot para ver o estado atual
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'supabase-url-config.png', fullPage: true });

  // Verificar se precisa de login
  const pageContent = await page.content();
  console.log('Page title:', await page.title());
  console.log('Current URL:', page.url());
});
