// Stroke redraws of the original 24-grid icons (stroke 1.5, round caps/joins),
// so they can animate with stroke-dashoffset. Shapes verified against the PNGs
// in out/iconos_comparacion.png. Keyed by the original asset basename.

const P = (d: string) => `<path d="${d}"/>`;
const C = (cx: number, cy: number, r: number) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;

const paw =
  C(10.94, 3.94, 2) +
  C(17.94, 7.94, 2) +
  C(19.94, 15.94, 2) +
  P('M5.95 9.89H9.04C12.47 9.89 13.9 13.32 13.9 14.82V18.61C13.9 20.31 12.65 21.91 10.65 21.91C8.35 21.91 7.04 20.31 7.04 18.91C7.04 17.8 5.6 17 4.2 16.4C2.7 15.75 1.9 14.6 1.9 13.04C1.9 11.24 4.15 9.89 5.95 9.89Z');

const heart = P('M12 21.56L3.7 13.62A5.61 5.61 0 1 1 12 6.11A5.61 5.61 0 1 1 20.3 13.62Z');

const chat =
  P('M16 10a2 2 0 0 1-2 2H5.5L2 15V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z') +
  P('M8 16v1a1.75 1.75 0 0 0 1.75 1.75H18.5L22 22V10.75A2.25 2.25 0 0 0 19.75 8.5');

const user = C(12, 7.95, 5) + P('M4 20.9a8 8 0 0 1 16 0');

const shieldUser =
  P('M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z') +
  P('M6.376 18.91a6 6 0 0 1 11.249.003') +
  C(12, 11, 4);

const pin =
  P('M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0') +
  C(12, 10, 3);

const bell =
  P('M10.268 21a2 2 0 0 0 3.464 0') +
  P('M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326');

const calendar =
  P('M8 2v4') + P('M16 2v4') +
  '<rect x="3" y="4" width="18" height="18" rx="2"/>' +
  P('M3 10h18') +
  P('M8 14h.01') + P('M12 14h.01') + P('M16 14h.01') +
  P('M8 18h.01') + P('M12 18h.01') + P('M16 18h.01');

const check = P('M20 6 9 17l-5-5');

const BODY: Record<string, string> = {
  img_001_s01: paw,
  img_002_s01: heart,
  img_003_s02: paw,
  img_004_s02: heart,
  img_005_s02: chat,
  img_006_s04: user,
  img_007_s04: shieldUser,
  img_089_s87: pin,
  img_090_s87: bell,
  img_091_s87: calendar,
  img_092_s87: check,
};

/** Returns an inline SVG for an original icon asset path, or null if it is not an icon. */
export function iconSvg(file: string, cls = ''): string | null {
  const key = file.replace(/^.*\//, '').replace(/\.png$/, '');
  const body = BODY[key];
  if (!body) return null;
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-icon="${key}">${body}</svg>`;
}

export const ICON_KEYS = Object.keys(BODY);
