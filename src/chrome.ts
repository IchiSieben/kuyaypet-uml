// Navigation chrome: lives outside [data-slide], asserts nothing new — every label is
// copied from the slides' own text (titles, view names) or is a slide number.
import type { BuiltSlide } from './slides';

const el = (tag: string, cls: string, html = '') => {
  const e = document.createElement(tag);
  e.className = cls;
  e.innerHTML = html;
  return e;
};
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const titleOf = (s: BuiltSlide) => s.el.querySelector('.title, .hu-title, .cover-title, .thanks-title')?.textContent ?? '';

export interface Chrome {
  update(i: number): void;
  toggleOverview(): void;
  toggleIndex(): void;
  openZoom(img: HTMLImageElement): void;
  closeAll(): boolean;
  isOpen(): boolean;
}

export function buildChrome(slides: BuiltSlide[], go: (i: number) => void): Chrome {
  const total = slides.length;

  // ---- Progress bar with a mark at the first slide of each HU ----
  const bar = el('div', 'progress');
  const fill = el('div', 'progress-fill');
  bar.appendChild(fill);
  const firstOfHu = new Map<number, number>();
  slides.forEach((s, i) => { if (s.hu && !firstOfHu.has(s.hu)) firstOfHu.set(s.hu, i); });
  for (const [, i] of firstOfHu) {
    const m = el('span', 'progress-mark');
    m.style.left = `${(i / (total - 1)) * 100}%`;
    bar.appendChild(m);
  }
  document.body.appendChild(bar);

  // ---- Overview (O): every slide as a card; HU slides show title + view ----
  const overview = el('div', 'panel overview');
  overview.setAttribute('role', 'dialog');
  overview.setAttribute('aria-label', 'Vista general');
  const grid = el('div', 'ov-grid');
  slides.forEach((s, i) => {
    const theme = s.el.classList.contains('dark') ? 'dark' : 'light';
    const card = el('button', `ov-card ${theme}`,
      `<span class="ov-n">${String(i + 1).padStart(2, '0')}</span><span class="ov-t">${esc(titleOf(s))}</span>${s.view ? `<span class="ov-v">${esc(s.view)}</span>` : ''}`);
    card.addEventListener('click', () => { close(); go(i); });
    grid.appendChild(card);
  });
  overview.appendChild(grid);
  document.body.appendChild(overview);

  // ---- HU index (H): 26 entries → first slide of that HU ----
  const index = el('div', 'panel hu-index');
  index.setAttribute('role', 'dialog');
  index.setAttribute('aria-label', 'Índice por HU');
  const list = el('div', 'hx-list');
  for (const [, i] of firstOfHu) {
    const t = titleOf(slides[i]);
    const k = t.indexOf(' | ');
    const b = el('button', 'hx-item', `<span class="hx-code">${esc(t.slice(0, k))}</span><span class="hx-name">${esc(t.slice(k + 3))}</span><span class="hx-n">${i + 1}</span>`);
    b.addEventListener('click', () => { close(); go(i); });
    list.appendChild(b);
  }
  index.appendChild(list);
  document.body.appendChild(index);

  // ---- Zoom / loupe on diagrams ----
  const zoom = el('div', 'panel zoom');
  zoom.setAttribute('role', 'dialog');
  zoom.setAttribute('aria-label', 'Diagrama ampliado');
  const zimg = document.createElement('img');
  zimg.alt = '';
  zimg.draggable = false;
  zoom.appendChild(zimg);
  document.body.appendChild(zoom);
  let scale = 1, tx = 0, ty = 0, drag: { x: number; y: number; tx: number; ty: number } | null = null, moved = false;
  const apply = () => { zimg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`; };
  zoom.addEventListener('wheel', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const r = zimg.getBoundingClientRect();
    const k = Math.exp(-e.deltaY * 0.0015);
    const ns = Math.min(8, Math.max(1, scale * k));
    const f = ns / scale;
    // keep the point under the cursor fixed
    const cx = e.clientX - (r.left + r.width / 2), cy = e.clientY - (r.top + r.height / 2);
    tx -= cx * (f - 1); ty -= cy * (f - 1);
    scale = ns;
    if (scale === 1) { tx = 0; ty = 0; }
    apply();
  }, { passive: false });
  zoom.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, tx, ty }; moved = false; zoom.setPointerCapture(e.pointerId); });
  zoom.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
    if (scale > 1) { tx = drag.tx + dx; ty = drag.ty + dy; apply(); }
  });
  zoom.addEventListener('pointerup', () => {
    const wasDrag = moved;
    drag = null;
    if (!wasDrag) {
      // click: first zooms in 2.5×, next click closes
      if (scale === 1) { scale = 2.5; apply(); } else close();
    }
  });

  let open: HTMLElement | null = null;
  function show(p: HTMLElement) { close(); p.classList.add('on'); open = p; }
  function close(): boolean {
    if (!open) return false;
    open.classList.remove('on');
    open = null;
    return true;
  }

  return {
    update(i) {
      fill.style.width = `${(i / (total - 1)) * 100}%`;
      grid.querySelectorAll('.ov-card').forEach((c, k) => c.classList.toggle('current', k === i));
      const hu = slides[i].hu;
      list.querySelectorAll<HTMLElement>('.hx-item').forEach((b) => b.classList.toggle('current', !!hu && b.querySelector('.hx-code')!.textContent === `HU-${String(hu).padStart(2, '0')}`));
    },
    toggleOverview() {
      if (open === overview) { close(); return; }
      show(overview);
      overview.querySelector('.ov-card.current')?.scrollIntoView({ block: 'center' });
    },
    toggleIndex() { if (open === index) close(); else show(index); },
    openZoom(img) {
      zimg.src = img.currentSrc || img.src;
      scale = 1; tx = 0; ty = 0; apply();
      show(zoom);
    },
    closeAll: close,
    isOpen: () => open !== null,
  };
}
