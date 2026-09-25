// Entrance animations ("each slide draws itself"), Web Animations API only.
// Invariants: animations never change textContent; the final state is the static
// layout; everything finishes in ≤ 2 s and can be skipped; reduced motion = no animation.

const EASE = 'cubic-bezier(.2,.7,.2,1)';
const overlays = import.meta.glob('./overlays/*.svg', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let running: Animation[] = [];
let gen = 0; // bumps on every enter/finish so late async work can tell it is stale
let cleanups: (() => void)[] = [];

function track(a: Animation) { running.push(a); return a; }

function rise(el: Element, delay: number, dur = 520, dy = 16) {
  track((el as HTMLElement).animate(
    [{ opacity: 0, transform: `translateY(${dy}px)` }, { opacity: 1, transform: 'none' }],
    { duration: dur, delay, easing: EASE, fill: 'backwards' },
  ));
}

function fade(el: Element, delay: number, dur = 420) {
  track((el as HTMLElement).animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, delay, easing: 'ease-out', fill: 'backwards' }));
}

/** Stroke-draw every pathLength=1 shape inside `root`. */
function draw(root: Element, delay: number, dur = 700, stagger = 60) {
  root.querySelectorAll<SVGGeometryElement>('[pathLength]').forEach((p, i) => {
    track(p.animate(
      [{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }],
      { duration: dur, delay: delay + i * stagger, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'backwards' },
    ));
  });
}

/** Count 0 → N on a numeric span via a CSS counter in ::after (textContent stays literal). */
function count(el: HTMLElement, delay: number, dur = 1100) {
  const target = Number(el.textContent);
  if (!Number.isFinite(target)) return;
  el.classList.add('counting');
  const a = track(el.animate([{ '--n': 0 } as Keyframe, { '--n': target } as Keyframe], { duration: dur, delay, easing: 'cubic-bezier(.2,.6,.2,1)', fill: 'both' }));
  const done = () => { el.classList.remove('counting'); a.cancel(); };
  a.finished.then(done, done);
  cleanups.push(done);
}

async function diagram(slide: HTMLElement, delay: number) {
  const sheet = slide.querySelector<HTMLElement>('.sheet');
  const img = sheet?.querySelector<HTMLImageElement>('img');
  if (!sheet || !img) return;
  const name = img.dataset.file!.replace(/^.*\//, '').replace(/\.png$/, '');
  const loader = overlays[`./overlays/${name}.svg`];
  const token = gen;
  img.style.opacity = '0';
  const showImg = () => { img.style.opacity = ''; };
  cleanups.push(showImg);
  let svgHost: HTMLElement | null = null;
  try {
    // Layout size comes from the width/height attributes, so drawing needn't wait for the PNG decode.
    const raw = loader ? await loader() : '';
    if (token !== gen) { showImg(); return; }
    if (!raw) throw new Error('sin overlay');
    svgHost = document.createElement('div');
    svgHost.className = 'draw-overlay';
    svgHost.setAttribute('aria-hidden', 'true');
    svgHost.innerHTML = raw;
    const paths = [...svgHost.querySelectorAll('path')];
    paths.forEach((p) => p.setAttribute('pathLength', '1'));
    sheet.appendChild(svgHost);
    // Draw in reading order (paths are pre-sorted) within ~1.3 s.
    const span = 1000, each = 420;
    const step = paths.length > 1 ? (span - each) / (paths.length - 1) : 0;
    paths.forEach((p, i) => {
      track(p.animate(
        [{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }],
        { duration: each, delay: delay + i * step, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'backwards' },
      ));
    });
    const t = delay + span;
    await img.decode().catch(() => undefined); // normally long done (pre-decoded as "next" slide)
    if (token !== gen) { showImg(); return; }
    showImg();
    track(img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, delay: t - 80, easing: 'ease-in-out', fill: 'backwards' }));
    const out = track(svgHost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, delay: t, easing: 'ease-in-out', fill: 'forwards' }));
    const host = svgHost;
    const rm = () => host.remove();
    out.finished.then(rm, rm);
    cleanups.push(rm);
  } catch {
    // Fallback: directional mask reveal of the original.
    showImg();
    const dir = slide.dataset.dir === 'y' ? 'to bottom' : 'to right';
    track(img.animate(
      [{ maskImage: `linear-gradient(${dir}, #000 0%, transparent 0%)` }, { maskImage: `linear-gradient(${dir}, #000 100%, transparent 100%)` }],
      { duration: 1200, delay, easing: EASE, fill: 'backwards' },
    ));
    svgHost?.remove();
  }
}

/** Warm up the next slide: fetch its overlay chunk and decode its PNG ahead of time. */
export function prefetch(slide: HTMLElement | undefined) {
  const img = slide?.querySelector<HTMLImageElement>('.sheet img[src]');
  if (!img) return;
  img.decode().catch(() => undefined);
  const name = img.dataset.file!.replace(/^.*\//, '').replace(/\.png$/, '');
  overlays[`./overlays/${name}.svg`]?.();
}

/** Run the entrance of one slide; resolves when it reached its final state. */
export async function enter(slide: HTMLElement): Promise<void> {
  finish();
  const token = ++gen;
  if (reducedMotion()) return;
  const q = <T extends Element = HTMLElement>(s: string) => [...slide.querySelectorAll<T>(s)] as T[];
  const tpl = [...slide.classList].find((c) => c.startsWith('tpl-'))!;
  const title = slide.querySelector('.title, .hu-title');
  if (title) rise(title, 0);

  switch (tpl) {
    case 'tpl-cover':
      rise(slide.querySelector('.cover-title')!, 0, 700, 24);
      rise(slide.querySelector('.cover-sub')!, 180);
      rise(slide.querySelector('.cover-meta')!, 420);
      draw(slide.querySelector('.i-paw')!, 250, 900, 120);
      draw(slide.querySelector('.i-heart')!, 1000, 700);
      break;
    case 'tpl-what':
      rise(slide.querySelector('.lead')!, 150);
      q('.pillar').forEach((p, i) => { draw(p.querySelector('svg')!, 350 + i * 220, 800, 90); rise(p.querySelector('.pillar-name')!, 500 + i * 220); rise(p.querySelector('.pillar-sub')!, 620 + i * 220); });
      break;
    case 'tpl-figures':
      q('.fig').forEach((f, i) => { fade(f, 150 + i * 150); count(f.querySelector('.fig-num')!, 150 + i * 150); rise(f.querySelector('.fig-label')!, 400 + i * 150); });
      rise(slide.querySelector('.fig-views')!, 1000);
      break;
    case 'tpl-actors':
      q('.actor').forEach((a, i) => { draw(a.querySelector('svg')!, 200 + i * 200, 800, 90); rise(a.querySelector('.actor-name')!, 250 + i * 200); rise(a.querySelector('.actor-hu')!, 380 + i * 200); });
      break;
    case 'tpl-criteria':
      count(slide.querySelector('.crit-num')!, 150);
      rise(slide.querySelector('.crit-what')!, 350);
      rise(slide.querySelector('.crit-kpi > .crit-note')!, 500);
      q('.crit-list li').forEach((li, i) => rise(li, 400 + i * 220));
      q('.crit-notes .crit-note').forEach((n, i) => rise(n, 1150 + i * 150));
      break;
    case 'tpl-hu':
      rise(slide.querySelector('.hu-meta')!, 120);
      { const al = slide.querySelector('.actor-line'); if (al) rise(al, 220); }
      fade(slide.querySelector('.sheet')!, 100, 300);
      await diagram(slide, 150);
      break;
    case 'tpl-flow': {
      const order = ['a', 'r1', 'b', 'r2', 'c', 'dn', 'd', 'l1', 'e', 'l2', 'f'];
      order.forEach((area, i) => {
        const el = slide.querySelector<HTMLElement>(`[style*="grid-area:${area}"]`)!;
        if (el.classList.contains('step')) { draw(el.querySelector('svg')!, 150 + i * 120, 600, 70); rise(el, 150 + i * 120, 480, 12); }
        else fade(el, 200 + i * 120, 300);
      });
      rise(slide.querySelector('.flow-foot')!, 1500);
      break;
    }
    case 'tpl-relation':
      rise(slide.querySelector('.rel-center')!, 100, 600, 0);
      draw(slide.querySelector('.rel-lines')!, 350, 700, 70);
      q('.rel-name, .rel-sub').forEach((el, i) => fade(el, 200 + Math.floor(i / 2) * 120));
      rise(slide.querySelector('.rel-note')!, 1200);
      break;
    case 'tpl-conclusions':
      q('.concl li').forEach((li, i) => { rise(li, 200 + i * 260); });
      break;
    case 'tpl-thanks':
      draw(slide.querySelector('.i-paw')!, 0, 900, 120);
      rise(slide.querySelector('.thanks-title')!, 300, 700, 20);
      rise(slide.querySelector('.thanks-sub')!, 550);
      break;
  }
  // Wait until every animation (including ones added while awaiting the diagram) has ended.
  while (token === gen && running.some((a) => a.playState !== 'finished' && a.playState !== 'idle')) {
    await Promise.all(running.map((a) => a.finished.catch(() => undefined)));
  }
  if (token === gen) { cleanups.forEach((c) => c()); cleanups = []; running = []; }
}

export const animating = () => running.some((a) => a.playState === 'running' || a.pending);

/** Jump every running animation to its end state and clean up. */
export function finish() {
  gen++;
  for (const a of running) { try { a.finish(); } catch { a.cancel(); } }
  cleanups.forEach((c) => c());
  cleanups = [];
  running = [];
  document.querySelectorAll('.draw-overlay').forEach((e) => e.remove());
}
