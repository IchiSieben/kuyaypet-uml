import { test, expect } from '@playwright/test';

test('comparación de íconos PNG vs SVG', async ({ page }) => {
  await page.setViewportSize({ width: 1250, height: 800 });
  await page.goto('http://localhost:5179/tools/icons.html');
  await page.waitForSelector('body[data-ready]');
  await page.screenshot({ path: 'out/iconos_comparacion.png', fullPage: true });
  const scores = await page.evaluate(() => (window as any).__scores as Record<string, number>);
  console.log(scores);
  for (const [k, v] of Object.entries(scores)) expect.soft(v, k).toBeGreaterThan(0.75);
});
