"""Build-time: vectorize each diagram PNG into a stroke overlay used only for the
entrance "drawing" animation. The original PNG is what stays on screen.

Text is removed first (small connected components), so only boxes, lines, arrows
and lifelines are traced; the text appears with the crossfade to the PNG.
Output: src/overlays/<asset>.svg (committed; CI does not need Python).
"""
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.measure import find_contours, approximate_polygon

OUT = 'src/overlays'
os.makedirs(OUT, exist_ok=True)
content = json.load(open('ref/content.json', encoding='utf-8'))


def clean_mask(path):
    g = np.asarray(Image.open(path).convert('L'))
    ink = g < 170
    lab, n = ndi.label(ink, structure=np.ones((3, 3)))
    big = np.zeros(n + 1, bool)
    dash = np.zeros(n + 1, bool)
    for i, sl in enumerate(ndi.find_objects(lab), start=1):
        h = sl[0].stop - sl[0].start
        w = sl[1].stop - sl[1].start
        big[i] = max(h, w) >= 40                         # lines, arrows, boxes, frames (text glyphs are smaller)
        dash[i] = not big[i] and min(h, w) <= 4 and max(h, w) >= 5
    keep = big[lab]
    # Dashed lines: chain thin dash candidates; keep only chains long enough to be a line.
    cand = dash[lab]
    for st in (np.ones((25, 1)), np.ones((1, 25))):
        cl = ndi.binary_closing(cand, structure=st)
        cl_lab, m = ndi.label(cl)
        long_ = np.zeros(m + 1, bool)
        for j, sl in enumerate(ndi.find_objects(cl_lab), start=1):
            long_[j] = max(sl[0].stop - sl[0].start, sl[1].stop - sl[1].start) >= 100
        keep |= cand & long_[cl_lab]
    return keep, g.shape


def paths(mask, direction):
    cs = find_contours(mask.astype(float), 0.5)
    out = []
    for c in cs:
        if len(c) < 8:
            continue
        poly = approximate_polygon(c, tolerance=1.2)
        ys, xs = poly[:, 0], poly[:, 1]
        key = xs.min() + ys.min() * 0.15 if direction == 'x' else ys.min() + xs.min() * 0.15
        d = 'M' + 'L'.join(f'{x:.0f} {y:.0f}' for y, x in poly)
        out.append((key, d))
    out.sort(key=lambda t: t[0])
    return [d for _, d in out]


def direction_for(view):
    # Reading direction: left→right for use case / components / collaboration, top→bottom for activity / sequence.
    return 'y' if view.startswith(('Actividades', 'Secuencia')) else 'x'


only = set(sys.argv[1:])
for s in content:
    if not 6 <= s['slide'] <= 86:
        continue
    img = s['images'][0]
    name = os.path.basename(img['file'])[:-4]
    if only and name not in only:
        continue
    view = next(t['t'] for t in s['text'] if t['color'] == '#247CAA')
    mask, (h, w) = clean_mask('ref/' + img['file'])
    ps = paths(mask, direction_for(view))
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" data-dir="{direction_for(view)}">'
           + ''.join(f'<path d="{d}"/>' for d in ps) + '</svg>')
    open(f'{OUT}/{name}.svg', 'w').write(svg)
    print(name, view, len(ps), f'{len(svg) / 1024:.0f} KB')
