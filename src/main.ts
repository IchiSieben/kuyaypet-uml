import '@fontsource-variable/inter';
import './style.css';
import { buildSlides } from './slides';

const W = 1920;
const H = 1080;

const stage = document.getElementById('stage')!;
const slides = buildSlides(stage);
const total = slides.length;
let current = 0; // 0-based

// ---- Scaling: fixed 1920×1080 logical canvas, letterboxed ----
function fit() {
  const s = Math.min(window.innerWidth / W, window.innerHeight / H);
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
}
window.addEventListener('resize', fit);
fit();

// ---- Diagram loading: only the current slide and the next one ----
function load(i: number) {
  const img = slides[i]?.el.querySelector<HTMLImageElement>('img[data-src]');
  if (img && !img.getAttribute('src')) img.src = img.dataset.src!;
}

async function markReady(i: number) {
  const img = slides[i].el.querySelector<HTMLImageElement>('img[data-src]');
  await document.fonts.ready;
  if (img) {
    try { await img.decode(); } catch { /* error surfaces in check via naturalWidth */ }
  }
  if (i === current) document.body.dataset.ready = String(i + 1);
}

// ---- Router ----
function show(i: number) {
  i = Math.max(0, Math.min(total - 1, i));
  delete document.body.dataset.ready;
  slides[current].el.classList.remove('active');
  current = i;
  slides[i].el.classList.add('active');
  load(i);
  load(i + 1);
  const hash = `#/${i + 1}`;
  if (location.hash !== hash) history.replaceState(null, '', hash);
  markReady(i);
}

function fromHash(): number {
  const m = /^#\/(\d+)$/.exec(location.hash);
  return m ? Number(m[1]) - 1 : 0;
}
window.addEventListener('hashchange', () => show(fromHash()));

const next = () => show(current + 1);
const prev = () => show(current - 1);

// ---- Keyboard: arrows/space/pages, F fullscreen, G + number + Enter ----
const gotoBox = document.createElement('div');
gotoBox.className = 'goto';
gotoBox.setAttribute('aria-live', 'polite');
document.body.appendChild(gotoBox);
let gotoBuf: string | null = null;
let gotoTimer = 0;

function endGoto(commit: boolean) {
  if (commit && gotoBuf) show(Number(gotoBuf) - 1);
  gotoBuf = null;
  gotoBox.classList.remove('on');
  clearTimeout(gotoTimer);
}

window.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (gotoBuf !== null) {
    if (/^\d$/.test(e.key) && gotoBuf.length < 2) {
      gotoBuf += e.key;
      gotoBox.textContent = `→ ${gotoBuf}`;
      clearTimeout(gotoTimer);
      gotoTimer = window.setTimeout(() => endGoto(true), 1500);
    } else if (e.key === 'Enter') endGoto(true);
    else if (e.key === 'Escape') endGoto(false);
    e.preventDefault();
    return;
  }
  switch (e.key) {
    case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': next(); break;
    case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': prev(); break;
    case 'Home': show(0); break;
    case 'End': show(total - 1); break;
    case 'f': case 'F':
      if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen();
      break;
    case 'g': case 'G':
      gotoBuf = '';
      gotoBox.textContent = '→ _';
      gotoBox.classList.add('on');
      gotoTimer = window.setTimeout(() => endGoto(false), 3000);
      break;
    default: return;
  }
  e.preventDefault();
});

// ---- Wheel (one step per gesture) ----
let wheelLock = 0;
window.addEventListener('wheel', (e) => {
  const now = Date.now();
  if (now < wheelLock || Math.abs(e.deltaY) < 8) return;
  wheelLock = now + 650;
  if (e.deltaY > 0) next(); else prev();
}, { passive: true });

// ---- Swipe ----
let touchX = 0, touchY = 0;
window.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) next(); else prev(); }
}, { passive: true });

// ---- Click: right two thirds advance, left third goes back ----
stage.addEventListener('click', (e) => {
  const r = stage.getBoundingClientRect();
  if (e.clientX - r.left < r.width / 3) prev(); else next();
});

slides[0].el.classList.remove('active');
show(fromHash());
