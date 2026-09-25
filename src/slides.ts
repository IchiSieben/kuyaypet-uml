// Builds the 90 slides from content.json. Every text span is rendered once, verbatim,
// as an element with data-span="<index>"; nested markup may style parts of it but
// never adds, removes or alters characters (npm run check enforces this).
import { SLIDES, diagramUrl, parseHu, type SlideData } from './content';
import { iconSvg } from './icons';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Span helper bound to one slide. `inner` must have the same textContent as the span. */
function spanner(d: SlideData) {
  const used = new Set<number>();
  const fn = (i: number, cls = '', inner?: string, tag = 'span') => {
    const t = d.text[i];
    if (!t) throw new Error(`Lámina ${d.slide}: span ${i} no existe`);
    if (used.has(i)) throw new Error(`Lámina ${d.slide}: span ${i} usado dos veces`);
    used.add(i);
    return `<${tag} data-span="${i}" class="${cls}">${inner ?? esc(t.t)}</${tag}>`;
  };
  fn.done = () => {
    if (used.size !== d.text.length) throw new Error(`Lámina ${d.slide}: ${d.text.length - used.size} spans sin renderizar`);
  };
  return fn;
}

const icon = (d: SlideData, i: number, cls = '') => {
  const svg = iconSvg(d.images[i].file, cls);
  if (!svg) throw new Error(`Lámina ${d.slide}: imagen ${i} no es ícono`);
  return svg;
};

const footerIndex = (d: SlideData) => d.text.findIndex((t) => t.t.startsWith('KuyayPet  /'));

type Tpl = (d: SlideData, s: ReturnType<typeof spanner>) => { theme: 'dark' | 'light'; tpl: string; html: string };

const cover: Tpl = (d, s) => ({
  theme: 'dark', tpl: 'cover',
  html: `
    <div class="cover-text">
      ${s(1, 'cover-title', undefined, 'h1')}
      ${s(2, 'cover-sub', undefined, 'p')}
      <div class="cover-meta">${s(3, 'cover-course', undefined, 'p')}${s(4, 'cover-uni', undefined, 'p')}</div>
    </div>
    <div class="cover-art">${icon(d, 0, 'i-paw')}${icon(d, 1, 'i-heart')}</div>`,
});

const what: Tpl = (d, s) => ({
  theme: 'light', tpl: 'what',
  html: `
    ${s(0, 'title', undefined, 'h2')}
    ${s(2, 'lead', undefined, 'p')}
    <div class="pillars">
      ${[0, 1, 2].map((k) => `<div class="pillar">${icon(d, k)}${s(3 + k * 2, 'pillar-name', undefined, 'h3')}${s(4 + k * 2, 'pillar-sub', undefined, 'p')}</div>`).join('')}
    </div>`,
});

const figures: Tpl = (_d, s) => ({
  theme: 'dark', tpl: 'figures',
  html: `
    ${s(0, 'title', undefined, 'h2')}
    <div class="figs">
      ${[0, 1, 2].map((k) => `<div class="fig">${s(2 + k * 2, 'fig-num num')}${s(3 + k * 2, 'fig-label', undefined, 'p')}</div>`).join('')}
    </div>
    ${s(8, 'fig-views', undefined, 'p')}`,
});

const actors: Tpl = (d, s) => ({
  theme: 'light', tpl: 'actors',
  html: `
    ${s(0, 'title', undefined, 'h2')}
    <div class="actor-grid">
      ${[0, 1, 2, 3].map((k) => `<div class="actor">${icon(d, k)}<div>${s(2 + k * 2, 'actor-name', undefined, 'h3')}${s(3 + k * 2, 'actor-hu', undefined, 'p')}</div></div>`).join('')}
    </div>`,
});

const criteria: Tpl = (_d, s) => ({
  theme: 'light', tpl: 'criteria',
  html: `
    ${s(0, 'title', undefined, 'h2')}
    <div class="crit">
      <div class="crit-kpi">
        ${s(2, 'crit-num num')}
        <p class="crit-what">${s(3, 'crit-line')}${s(4, 'crit-line')}</p>
        ${s(5, 'crit-note', undefined, 'p')}
      </div>
      <div class="crit-list">
        <ol>${[0, 1, 2].map((k) => `<li>${s(6 + k * 2, 'ord num')}${s(7 + k * 2, 'ord-text')}</li>`).join('')}</ol>
        <div class="crit-notes">${s(12, 'crit-note', undefined, 'p')}${s(13, 'crit-note', undefined, 'p')}</div>
      </div>
    </div>`,
});

const hu: Tpl = (d, s) => {
  const ti = d.text.findIndex((t) => t.t.startsWith('HU-'));
  const vi = d.text.findIndex((t) => t.color === '#247CAA');
  const pi = d.text.findIndex((t) => t.t.startsWith('PDF'));
  const ai = d.text.findIndex((t, i) => i !== ti && i !== pi && t.color === '#517084' && !t.t.startsWith('KuyayPet'));
  const info = parseHu(d.text[ti].t)!;
  const titleInner = `<span class="hu-code">${esc(info.code)}</span><span class="hu-sep"> | </span><span class="hu-name">${esc(info.name)}</span>`;
  let actorHtml = '';
  if (ai >= 0) {
    const a = d.text[ai].t;
    const k = a.indexOf('  ·  ');
    actorHtml = s(ai, 'actor-line', k < 0 ? esc(a) : `<span class="actor-who">${esc(a.slice(0, k))}</span><span class="actor-dot">${esc(a.slice(k, k + 5))}</span>${esc(a.slice(k + 5))}`, 'p');
  }
  const img = d.images[0];
  const ratio = img.px[0] / img.px[1];
  const titleScale = d.text[ti].size / 30;
  return {
    theme: 'light', tpl: ratio >= 4 ? 'hu wide' : 'hu',
    html: `
      <header class="hu-head">
        ${s(ti, 'hu-title', titleInner, 'h2').replace('class="hu-title"', `class="hu-title" style="--ts:${titleScale}"`)}
        <div class="hu-meta">${s(vi, 'view')}${s(pi, 'pdf')}</div>
        ${actorHtml}
      </header>
      <div class="sheet-wrap">
        <figure class="sheet"><img alt="" data-src="${diagramUrl(img.file)}" data-file="${img.file}" width="${img.px[0]}" height="${img.px[1]}" draggable="false"></figure>
      </div>`,
  };
};

const flow: Tpl = (d, s) => {
  const step = (ic: number, name: number, hu: number, area: string) =>
    `<div class="step" style="grid-area:${area}">${icon(d, ic)}${s(name, 'step-name', undefined, 'h3')}${s(hu, 'step-hu', undefined, 'p')}</div>`;
  const arrow = (i: number, area: string) => `<div class="arrow" style="grid-area:${area}">${s(i, 'arrow-glyph')}</div>`;
  return {
    theme: 'light', tpl: 'flow',
    html: `
      ${s(0, 'title', undefined, 'h2')}
      <div class="flow-grid">
        ${step(0, 2, 3, 'a')}${arrow(4, 'r1')}${step(1, 5, 6, 'b')}${arrow(7, 'r2')}${step(2, 8, 9, 'c')}
        ${arrow(10, 'dn')}
        ${step(5, 17, 18, 'f')}${arrow(16, 'l2')}${step(4, 14, 15, 'e')}${arrow(13, 'l1')}${step(3, 11, 12, 'd')}
      </div>
      <div class="flow-foot">${s(19, 'flow-admin', undefined, 'p')}${s(20, 'flow-note', undefined, 'p')}</div>`,
  };
};

const relation: Tpl = (d, s) => {
  // Radial scheme: positions follow the original (pt ×2 on the 1920×1080 canvas).
  const at = (i: number, cls: string) => {
    const [x0, y0, x1] = d.text[i].bbox;
    return s(i, `abs ${cls}`, undefined, 'span').replace(`class="abs ${cls}"`, `class="abs ${cls}" style="left:${(x0 + x1)}px;top:${y0 * 2}px"`);
  };
  const lines = d.drawings.filter((g) => g.type === 's').map((g) => {
    const [x0, y0, x1, y1] = g.rect;
    return `<line x1="${x0 * 2}" y1="${y0 * 2}" x2="${x1 * 2}" y2="${y1 * 2}" />`;
  }).join('');
  return {
    theme: 'light', tpl: 'relation',
    html: `
      ${s(0, 'title', undefined, 'h2')}
      <div class="rel-group">
        <svg class="rel-lines" viewBox="0 0 1920 1080" aria-hidden="true">${lines}</svg>
        ${at(2, 'rel-center')}
        ${[3, 5, 7, 9, 11].map((i) => at(i, 'rel-name') + at(i + 1, 'rel-sub')).join('')}
      </div>
      ${at(13, 'rel-note')}`,
  };
};

const conclusions: Tpl = (_d, s) => ({
  theme: 'dark', tpl: 'conclusions',
  html: `
    ${s(0, 'title', undefined, 'h2')}
    <ol class="concl">${[0, 1, 2].map((k) => `<li>${s(2 + k * 2, 'ord num')}${s(3 + k * 2, 'concl-text')}</li>`).join('')}</ol>`,
});

const thanks: Tpl = (d, s) => ({
  theme: 'dark', tpl: 'thanks',
  html: `
    <div class="thanks">${icon(d, 0, 'i-paw')}${s(1, 'thanks-title', undefined, 'h1')}${s(2, 'thanks-sub', undefined, 'p')}</div>`,
});

function templateFor(n: number): Tpl {
  if (n === 1) return cover;
  if (n === 2) return what;
  if (n === 3) return figures;
  if (n === 4) return actors;
  if (n === 5) return criteria;
  if (n >= 6 && n <= 86) return hu;
  if (n === 87) return flow;
  if (n === 88) return relation;
  if (n === 89) return conclusions;
  return thanks;
}

export interface BuiltSlide { n: number; el: HTMLElement; hu: number | null; view: string | null }

export function buildSlides(stage: HTMLElement): BuiltSlide[] {
  return SLIDES.map((d) => {
    const s = spanner(d);
    const { theme, tpl, html } = templateFor(d.slide)(d, s);
    const fi = footerIndex(d);
    const footer = s(fi, 'slide-footer', undefined, 'footer');
    s.done();
    const el = document.createElement('section');
    el.className = `slide ${theme} tpl-${tpl}`;
    el.dataset.slide = String(d.slide);
    el.innerHTML = html + footer;
    stage.appendChild(el);
    const title = d.text.find((t) => t.t.startsWith('HU-'));
    const hu = title ? parseHu(title.t)?.num ?? null : null;
    const view = hu ? d.text.find((t) => t.color === '#247CAA')?.t ?? null : null;
    return { n: d.slide, el, hu, view };
  });
}
