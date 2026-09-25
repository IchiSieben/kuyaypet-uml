// Checks a deployed copy: slides render, a diagram loads, both PDFs are served.
import { chromium } from '@playwright/test';
const bases = process.argv.slice(2);
const browser = await chromium.launch();
let ok = true;
for (const base of bases) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  try {
    await page.goto(base + '#/6', { waitUntil: 'load' });
    await page.waitForSelector('body[data-ready="6"]', { timeout: 30000 });
    const n = await page.locator('[data-slide]').count();
    const w = await page.evaluate(() => document.querySelector('[data-slide="6"] img').naturalWidth);
    const pdfs = [];
    for (const f of ['KuyayPet_Presentacion_UML.pdf', 'KuyayPet_Funcionalidades_Principales.pdf']) {
      const r = await page.request.get(base + f);
      const b = await r.body();
      pdfs.push(`${f}: ${r.status()} ${r.headers()['content-type']} ${b.length}B ${b.subarray(0, 5).toString()}`);
      if (r.status() !== 200 || b.subarray(0, 4).toString() !== '%PDF') ok = false;
    }
    console.log(base, `láminas=${n}`, `diagrama6=${w}px`, '\n  ' + pdfs.join('\n  '));
    if (n !== 90 || w !== 2052) ok = false;
  } catch (e) { ok = false; console.log(base, 'ERROR', e.message); }
}
await browser.close();
process.exit(ok ? 0 : 1);
