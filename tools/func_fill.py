"""Fill the "[INSERTAR CAPTURA WEB: …]" / logo boxes of the team's 20-page PDF.
The original page images are left untouched; phone-framed crops are inserted as
separate images over the inner area of each box only (below the PROTOTIPO WEB bar)."""
import io, json
import numpy as np
import fitz
from PIL import Image, ImageDraw
from scipy.ndimage import label

SRC = 'ref/KuyayPet_Funcionalidades_Principales.pdf'
OUT = 'out/KuyayPet_Funcionalidades_Principales_con_prototipo.pdf'
SHOTS = '../Kuyaypet_ingsoft/docs/screenshots/'
LOGO = '../Kuyaypet_ingsoft/public/pwa-512.png'
S = 2  # overlay supersampling vs page pixels (page image is 2560 px wide)

SEEDS = {1: (1958, 1165), 5: (207, 1032), 6: (196, 1032), 7: (188, 1032), 8: (176, 1032), 9: (181, 1200),
         10: (150, 1240), 11: (150, 1240), 12: (177, 1132), 13: (181, 1258), 14: (172, 1258),
         15: (172, 1268), 16: (168, 1052), 20: (944, 1218)}
# page -> list of (screenshot, crop centre y in the 1170x2532 capture)
PLAN = {
    5: [('HU-01-registro', 720), ('HU-01-registro', 1850)],
    6: [('HU-03-perfil', 1300), ('HU-03-perfil', 2080)],
    7: [('HU-06-deck', 820), ('HU-06-deck', 1900)],
    8: [('HU-07-match', 700), ('HU-07-match', 1560)],
    9: [('HU-20-matches', 720), ('HU-20-matches', 1150), ('HU-20-matches', 1850)],
    10: [('HU-08-chat', 620)],
    11: [('HU-10-coordinar', 560)],
    12: [('HU-10-enviada', 1330)],
    13: [('HU-13-responsable', 600), ('HU-13-responsable', 950), ('HU-13-responsable', 1520)],
    14: [('HU-13-notificaciones', 620), ('HU-13-notificaciones', 970), ('HU-13-notificaciones', 1320)],
    15: [('HU-24-admin', 632), ('HU-24-admin', 1440), ('HU-24-admin', 1880)],
    16: [('HU-24-admin', 800), ('HU-24-admin', 1650)],
}


def inner_box(page_png, seed, header=True):
    a = np.asarray(page_png).astype(int)
    sx, sy = seed
    fill = a[sy, sx]
    comp = label(np.abs(a - fill).sum(axis=2) < 14)[0]
    ys, xs = np.where(comp == comp[sy, sx])
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max(), ys.max()
    # The header bar shares the fill colour; its divider is the first non-fill row below the top.
    xm = (x0 + x1) // 2 + 7
    top = y0
    for y in (range(y0 + 5, min(y0 + 160, y1)) if header else ()):
        if np.abs(a[y, xm] - fill).sum() > 40:
            top = y + 3
            break
    return int(x0), int(top), int(x1), int(y1), tuple(int(v) for v in fill)


def phone(crop, w, h):
    """Phone-style bezel around a crop, w x h px (overlay resolution)."""
    bez, r = max(6, h // 40), max(18, h // 9)
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, w - 1, h - 1), r, fill=(22, 22, 28, 255))
    iw, ih = w - 2 * bez, h - 2 * bez
    scr = crop.resize((iw, ih), Image.LANCZOS)
    m = Image.new('L', (iw, ih), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, iw - 1, ih - 1), r - bez, fill=255)
    img.paste(scr, (bez, bez), m)
    return img


def base(W, H, fill):
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(c).rounded_rectangle((0, 0, W - 1, H - 1), 22 * S, fill=fill + (255,))
    return c


def compose(page, box, fill):
    x0, y0, x1, y1 = box
    W, H = (x1 - x0) * S, (y1 - y0) * S
    low = (y1 - y0) < 250  # low, wide boxes: thinner margins, wider panels for legibility
    pad, gap = (8 * S, 16 * S) if low else (22 * S, 26 * S)
    canvas = base(W, H, fill)
    items = PLAN[page]
    n = len(items)
    ph = H - 2 * pad
    pw = int(min((W - 2 * pad - (n - 1) * gap) / n, ph * (99 if low else 1.9)))
    total = n * pw + (n - 1) * gap
    x = (W - total) // 2
    for name, cy in items:
        shot = Image.open(SHOTS + name + '.png').convert('RGB')
        ch = round(shot.width * ph / pw)
        top = max(0, min(shot.height - ch, cy - ch // 2))
        canvas.alpha_composite(phone(shot.crop((0, top, shot.width, top + ch)), pw, ph), (x, pad))
        x += pw + gap
    return canvas


def logo(box, fill):
    x0, y0, x1, y1 = box
    W, H = (x1 - x0) * S, (y1 - y0) * S
    side = int(min(W, H) * 0.86)
    lg = Image.open(LOGO).convert('RGBA').resize((side, side), Image.LANCZOS)
    c = base(W, H, fill)
    c.alpha_composite(lg, ((W - side) // 2, (H - side) // 2))
    return c


doc = fitz.open(SRC)
boxes = {}
for p, seed in SEEDS.items():
    page = doc[p - 1]
    xref = page.get_images(full=True)[0][0]
    png = Image.open(io.BytesIO(fitz.Pixmap(doc, xref).tobytes('png'))).convert('RGB')
    k = page.rect.width / png.width
    is_logo = p in (1, 20)  # logo boxes have no header bar
    x0, y0, x1, y1, fill = inner_box(png, seed, header=not is_logo)
    if is_logo:
        box = (x0 + 4, y0 + 4, x1 - 4, y1 - 4)
        ov = logo(box, fill)
    else:
        box = (x0 + 4, y0, x1 - 4, y1 - 4)
        ov = compose(p, box, fill)
    boxes[p] = box
    buf = io.BytesIO(); ov.save(buf, 'PNG')
    rect = fitz.Rect(box[0] * k, box[1] * k, box[2] * k, box[3] * k)
    page.insert_image(rect, stream=buf.getvalue(), keep_proportion=False)
doc.save(OUT, garbage=3, deflate=True)
json.dump(boxes, open('out/func/boxes.json', 'w'))
print(boxes)
