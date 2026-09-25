// Fidelity gate: the rendered deck must carry exactly the team's content.
import { test, expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const BASE = 'http://localhost:4173/';
const content = JSON.parse(readFileSync('ref/content.json', 'utf8')) as {
  slide: number; text: { t: string }[]; images: { file: string; px: [number, number] }[];
}[];
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex');
const pad = (n: number) => String(n).padStart(2, '0');

async function goto(page: Page, n: number) {
  await page.evaluate((n) => { location.hash = `#/${n}`; }, n);
  await page.waitForSelector(`body[data-ready="${n}"]`, { timeout: 20_000 });
}

test('90 láminas en orden con texto literal', async ({ page }) => {
  await page.goto(BASE);
  const slides = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-slide]')].map((el) => {
      const spans = [...el.querySelectorAll<HTMLElement>('[data-span]')];
      const styled = [el, ...el.querySelectorAll<HTMLElement>('*')].map((e) => {
        const cs = getComputedStyle(e);
        const before = getComputedStyle(e, '::before').content;
        const after = getComputedStyle(e, '::after').content;
        return { tt: cs.textTransform, before, after };
      });
      return {
        n: Number(el.dataset.slide),
        spans: spans.map((s) => ({ i: Number(s.dataset.span), text: s.textContent ?? '', tag: s.tagName })),
        all: (el.textContent ?? '').replace(/\s+/g, ''),
        styled,
      };
    }),
  );

  expect(slides.length, 'cantidad de láminas').toBe(90);
  expect(slides.map((s) => s.n), 'orden de láminas').toEqual(content.map((c) => c.slide));

  for (const [k, s] of slides.entries()) {
    const src = content[k];
    const n = src.slide;
    // Every span exactly once, verbatim (whitespace-normalized only).
    const idx = s.spans.map((x) => x.i).sort((a, b) => a - b);
    expect(idx, `lámina ${n}: índices de spans`).toEqual(src.text.map((_, i) => i));
    for (const sp of s.spans) {
      expect(norm(sp.text), `lámina ${n}, span ${sp.i}`).toBe(norm(src.text[sp.i].t));
    }
    // No text inside the slide other than the spans.
    expect(s.all, `lámina ${n}: texto fuera de los spans`).toBe(s.spans.map((x) => x.text).join('').replace(/\s+/g, ''));
    // No CSS that alters what the audience reads.
    for (const st of s.styled) {
      expect(st.tt, `lámina ${n}: text-transform`).toBe('none');
      for (const c of [st.before, st.after]) expect(['none', 'normal', '""'], `lámina ${n}: content en pseudo-elemento`).toContain(c);
    }
    // Footer "KuyayPet / NN" present, rendered as the footer.
    const foot = s.spans.find((x) => norm(x.text) === `KuyayPet / ${pad(n)}`);
    expect(foot, `lámina ${n}: pie`).toBeTruthy();
    expect(foot!.tag, `lámina ${n}: pie como <footer>`).toBe('FOOTER');
    // HU slides carry "PDF · p. N".
    if (n >= 6 && n <= 86) {
      expect(s.spans.some((x) => /^PDF · p\. \d+$/.test(norm(x.text))), `lámina ${n}: PDF · p. N`).toBe(true);
    }
  }
});

test('diagramas idénticos al original (bytes decodificados)', async ({ page, request }) => {
  await page.goto(BASE);
  for (const src of content.filter((c) => c.slide >= 6 && c.slide <= 86)) {
    const n = src.slide;
    await goto(page, n);
    const info = await page.evaluate((n) => {
      const img = document.querySelector<HTMLImageElement>(`[data-slide="${n}"] img`)!;
      return { url: img.currentSrc || img.src, w: img.naturalWidth, h: img.naturalHeight, file: img.dataset.file };
    }, n);
    const expected = src.images[0];
    expect(info.file, `lámina ${n}: archivo`).toBe(expected.file);
    expect([info.w, info.h], `lámina ${n}: tamaño natural`).toEqual(expected.px);
    let bytes: Buffer;
    if (info.url.startsWith('data:')) {
      bytes = Buffer.from(info.url.slice(info.url.indexOf(',') + 1), 'base64');
    } else {
      const r = await request.get(info.url);
      expect(r.ok(), `lámina ${n}: descarga`).toBe(true);
      bytes = await r.body();
    }
    expect(sha(bytes), `lámina ${n}: hash de ${expected.file}`).toBe(sha(readFileSync(`ref/${expected.file}`)));
  }
});

test('precarga solo la lámina actual y la siguiente', async ({ page }) => {
  for (const n of [1, 6, 20, 86]) {
    await page.goto('about:blank'); // fresh load: a hash-only goto would keep the previous state
    await page.goto(`${BASE}#/${n}`);
    await page.waitForSelector(`body[data-ready="${n}"]`);
    const loaded = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLImageElement>('[data-slide] img[src]')].map((i) => Number(i.closest<HTMLElement>('[data-slide]')!.dataset.slide)),
    );
    const allowed = [n, n + 1].filter((k) => k >= 6 && k <= 86);
    expect(loaded.sort((a, b) => a - b), `desde #/${n}`).toEqual(allowed);
  }
});

test('ningún texto queda cortado fuera de la lámina', async ({ page }) => {
  for (const vp of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(vp);
    await page.goto(BASE);
    for (let n = 1; n <= 90; n++) {
      await goto(page, n);
      const out = await page.evaluate((n) => {
        const slide = document.querySelector<HTMLElement>(`[data-slide="${n}"]`)!;
        const r = slide.getBoundingClientRect();
        return [...slide.querySelectorAll<HTMLElement>('[data-span]')].flatMap((el) => {
          const b = el.getBoundingClientRect();
          const clipped = b.left < r.left - 0.5 || b.right > r.right + 0.5 || b.top < r.top - 0.5 || b.bottom > r.bottom + 0.5;
          const overflow = el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible';
          return clipped || overflow ? [`span ${el.dataset.span}: ${el.textContent}`] : [];
        });
      }, n);
      expect(out, `lámina ${n} a ${vp.width}x${vp.height}`).toEqual([]);
    }
  }
});
