import raw from '../ref/content.json';

export interface Span { t: string; font: string; size: number; color: string; bbox: [number, number, number, number] }
export interface Img { file: string; bbox: [number, number, number, number]; px: [number, number] }
export interface Drawing { type: string; rect: [number, number, number, number]; fill: string | null; stroke: string | null; width: number | null }
export interface SlideData { slide: number; size: [number, number]; text: Span[]; images: Img[]; drawings: Drawing[] }

export const SLIDES = raw as unknown as SlideData[];

// Diagram PNGs (slides 6–86) are emitted by Vite as-is: assetsInlineLimit 0, no optimizer.
const DIAGRAM_URLS = import.meta.glob('../ref/assets/img_{00[89],0[1-7][0-9],08[0-8]}_s*.png', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function diagramUrl(file: string): string {
  const url = DIAGRAM_URLS[`../ref/${file}`];
  if (!url) throw new Error(`Diagrama no encontrado: ${file}`);
  return url;
}

export interface HuInfo { code: string; num: number; name: string }

/** "HU-01 | Registro de usuario" -> { code: "HU-01", num: 1, name } */
export function parseHu(title: string): HuInfo | null {
  const m = /^(HU-(\d{2}))( \| )(.*)$/.exec(title);
  return m ? { code: m[1], num: Number(m[2]), name: m[4] } : null;
}
