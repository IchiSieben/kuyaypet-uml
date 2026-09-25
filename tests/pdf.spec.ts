// Exports the final state of the 90 slides to a 16:9 PDF with selectable text.
import { test } from '@playwright/test';

test('exportar PDF', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:4173/?print');
  await page.waitForSelector('body[data-ready="print"]', { timeout: 120_000 });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: 'out/KuyayPet_Presentacion_UML.pdf',
    width: '1920px',
    height: '1080px',
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    printBackground: true,
    preferCSSPageSize: true,
  });
});
