import { iconSvg, ICON_KEYS } from '../src/icons';

const COLORS: Record<string, string> = { img_001_s01: '#A9DDF0', img_002_s01: '#E5A16A' };
const S = 192;

function mask(draw: (ctx: CanvasRenderingContext2D) => void): Uint8Array {
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d')!;
  draw(ctx);
  const d = ctx.getImageData(0, 0, S, S).data;
  const m = new Uint8Array(S * S);
  for (let i = 0; i < S * S; i++) m[i] = d[i * 4 + 3] > 128 ? 1 : 0;
  return m;
}
const load = (src: string) => new Promise<HTMLImageElement>((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });

async function main() {
  const rows = document.getElementById('rows')!;
  const scores: Record<string, number> = {};
  for (const key of ICON_KEYS) {
    const color = COLORS[key] ?? '#247CAA';
    const dark = key.endsWith('_s01');
    const png = new URL(`../ref/assets/${key}.png`, import.meta.url).href;
    const svg = iconSvg(key)!.replace('<svg ', `<svg width="${S}" height="${S}" style="color:${color}" `);
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div>${key}</div>
      <div class="cell ${dark ? 'dark' : ''}"><img src="${png}"></div>
      <div class="cell ${dark ? 'dark' : ''}">${svg}</div>
      <div class="cell ov"><img src="${png}">${svg}</div>
      <div class="score"></div>`;
    rows.appendChild(row);
    const img = await load(png);
    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace('currentColor', '#000'));
    const simg = await load(svgUrl);
    const a = mask((c) => c.drawImage(img, 0, 0, S, S));
    const b = mask((c) => c.drawImage(simg, 0, 0, S, S));
    let inter = 0, uni = 0;
    for (let i = 0; i < a.length; i++) { inter += a[i] & b[i]; uni += a[i] | b[i]; }
    const iou = inter / uni;
    scores[key] = iou;
    const el = row.querySelector('.score')!;
    el.textContent = iou.toFixed(3);
    if (iou < 0.75) el.classList.add('bad');
  }
  (window as any).__scores = scores;
  document.body.dataset.ready = '1';
}
main();
