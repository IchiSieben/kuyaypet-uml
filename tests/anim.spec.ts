// Phase 2: entrance animations end in exactly the static final state; chrome works.
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.use({ reducedMotion: 'no-preference', viewport: { width: 1920, height: 1080 } });
const BASE = 'http://localhost:4173/';
const content = JSON.parse(readFileSync('ref/content.json', 'utf8')) as { slide: number; text: { t: string }[] }[];
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

async function finalState(page: Page, n: number) {
  return page.evaluate((n) => {
    const s = document.querySelector<HTMLElement>(`[data-slide="${n}"]`)!;
    const spans = [...s.querySelectorAll<HTMLElement>('[data-span]')];
    const img = s.querySelector<HTMLImageElement>('.sheet img');
    const hidden = [s, ...s.querySelectorAll<HTMLElement>('*')].filter((e) => {
      if (e.closest('.draw-overlay')) return false;
      const cs = getComputedStyle(e);
      return Number(cs.opacity) < 0.999 || (cs.transform !== 'none' && !e.closest('.rel-group') && e !== s && !e.classList.contains('abs'));
    }).map((e) => e.className || e.tagName);
    return {
      texts: spans.map((x) => ({ i: Number(x.dataset.span), t: x.textContent ?? '' })),
      all: (s.textContent ?? '').replace(/\s+/g, ''),
      overlay: s.querySelectorAll('.draw-overlay').length,
      counting: s.querySelectorAll('.counting').length,
      imgOpacity: img ? getComputedStyle(img).opacity : '1',
      running: document.getAnimations().filter((a) => a.playState === 'running').length,
      hidden,
    };
  }, n);
}

for (const n of [1, 2, 3, 4, 5, 6, 13, 19, 87, 88, 89, 90]) {
  test(`lámina ${n}: la animación termina en el estado final exacto`, async ({ page }) => {
    await page.goto(`${BASE}#/${n}`);
    await page.waitForSelector(`body[data-ready="${n}"]`, { timeout: 15_000 });
    const st = await finalState(page, n);
    expect(st.running, 'animaciones en curso').toBe(0);
    expect(st.overlay, 'overlay de dibujo retirado').toBe(0);
    expect(st.counting, 'contadores retirados').toBe(0);
    expect(st.imgOpacity, 'diagrama visible').toBe('1');
    expect(st.hidden, 'elementos aún ocultos o desplazados').toEqual([]);
    for (const x of st.texts) expect(norm(x.t), `span ${x.i}`).toBe(norm(content[n - 1].text[x.i].t));
    expect(st.all).toBe(st.texts.map((x) => x.t).join('').replace(/\s+/g, ''));
  });
}

test('entrada de una lámina de HU dura ≤ 2 s y una tecla la salta', async ({ page }) => {
  await page.goto(`${BASE}#/5`);
  await page.waitForSelector('body[data-ready="5"]');
  const t0 = Date.now();
  await page.keyboard.press('ArrowRight');
  await page.waitForSelector('body[data-ready="6"]', { timeout: 5000 });
  expect(Date.now() - t0, 'duración de la entrada').toBeLessThan(2600);
  await page.keyboard.press('ArrowRight'); // → 7, then skip immediately
  await page.waitForTimeout(150);
  await page.keyboard.press('ArrowRight'); // skips, does not navigate
  await page.waitForSelector('body[data-ready="7"]', { timeout: 1000 });
  expect(page.url()).toContain('#/7');
  const st = await finalState(page, 7);
  expect(st.overlay).toBe(0);
  expect(st.imgOpacity).toBe('1');
});

test('vista general, índice por HU y lupa', async ({ page }) => {
  await page.goto(`${BASE}#/1`);
  await page.waitForSelector('body[data-ready="1"]');
  await page.keyboard.press('h');
  await expect(page.locator('.hu-index.on .hx-item')).toHaveCount(26);
  await page.locator('.hx-item', { hasText: 'HU-13' }).click();
  await page.waitForSelector('body[data-ready="45"]');
  expect(page.url()).toContain('#/45');
  await page.keyboard.press('o');
  await expect(page.locator('.overview.on .ov-card')).toHaveCount(90);
  await page.locator('.ov-card').nth(87).click();
  await page.waitForSelector('body[data-ready="88"]');
  await page.goto(`${BASE}#/13`);
  await page.waitForSelector('body[data-ready="13"]');
  await page.locator('[data-slide="13"] .sheet').click();
  await expect(page.locator('.zoom.on img')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.zoom.on')).toHaveCount(0);
  // chrome never adds slides or text inside slides
  expect(await page.locator('[data-slide]').count()).toBe(90);
});
