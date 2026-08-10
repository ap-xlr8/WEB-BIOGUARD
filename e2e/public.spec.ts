import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('la portada comunica el flujo real sin desbordamiento', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/BioGuard/);
  await expect(page.getByRole('heading', { level: 1, name: 'BioGuard' })).toBeVisible();
  await expect(page.getByText('El móvil recibe por Bluetooth')).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
});

test('el menú móvil es operable y conserva el foco semántico', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Prueba exclusiva de viewport móvil');
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true');
});

test('las rutas legales públicas responden', async ({ page }) => {
  for (const route of ['/terminos', '/privacidad', '/cookies', '/aviso-legal']) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  }
});

test('la portada no presenta infracciones WCAG automáticas', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});
