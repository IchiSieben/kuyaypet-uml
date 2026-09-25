// Final-state screenshots of every slide + contact sheets (not part of npm run check).
import { test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const BASE = 'http://localhost:4173/';
const pad = (n: number) => String(n).padStart(2, '0');
const SIZES = [
  { w: 1920, h: 1080, dir: 'out/screens' },
  { w: 1366, h: 768, dir: 'out/screens/1366' },
];

async function shootAll(page: Page, dir: string) {
  mkdirSync(dir, { recursive: true });
  await page.goto(BASE);
  await page.waitForSelector('body[data-ready="1"]');
  for (let n = 1; n <= 90; n++) {
    await page.evaluate((n) => { location.hash = `#/${n}`; }, n);
    await page.waitForSelector(`body[data-ready="${n}"]`);
    await page.screenshot({ path: `${dir}/slide_${pad(n)}.png` });
  }
}

async function sheet(page: Page, dir: string, from: number, to: number, cols: number, tileW: number, out: string) {
  const tileH = Math.round((tileW * 9) / 16);
  const tiles = [];
  for (let n = from; n <= to; n++) {
    const src = pathToFileURL(resolve(`${dir}/slide_${pad(n)}.png`)).href;
    tiles.push(`<figure><img src="${src}"><figcaption>${n}</figcaption></figure>`);
  }
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:12px;background:#2b2f36;display:grid;grid-template-columns:repeat(${cols},${tileW}px);gap:10px;width:max-content}
    figure{margin:0;position:relative}img{display:block;width:${tileW}px;height:${tileH}px}
    figcaption{position:absolute;left:6px;top:6px;background:#E5A16A;color:#102D47;font:700 16px system-ui;padding:2px 7px;border-radius:4px}
  </style>${tiles.join('')}`;
  const file = resolve(`${dir}/_sheet.html`);
  writeFileSync(file, html);
  await page.goto(pathToFileURL(file).href);
  await page.waitForLoadState('load');
  await page.screenshot({ path: out, fullPage: true });
}

for (const s of SIZES) {
  test(`capturas ${s.w}x${s.h}`, async ({ page }) => {
    await page.setViewportSize({ width: s.w, height: s.h });
    await shootAll(page, s.dir);
    await page.setViewportSize({ width: 1400, height: 900 });
    if (s.w === 1920) await sheet(page, s.dir, 1, 90, 10, 320, `${s.dir}/contact.png`);
    for (let k = 0; k < 3; k++) {
      await sheet(page, s.dir, k * 30 + 1, k * 30 + 30, 5, 480, `${s.dir}/contact_${k + 1}.png`);
    }
  });
}
