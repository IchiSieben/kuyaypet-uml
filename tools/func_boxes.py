"""Locate the inner area of each placeholder box by flood fill from a seed point."""
import json, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import label

SEEDS = {1: (1958, 1165), 5: (207, 1032), 6: (196, 1032), 7: (188, 1032), 8: (176, 1032), 9: (181, 1200),
         10: (161, 1298), 11: (151, 1298), 12: (177, 1132), 13: (181, 1258), 14: (172, 1258),
         15: (172, 1268), 16: (168, 1052), 20: (944, 1218)}
out = {}
for p, (sx, sy) in SEEDS.items():
    a = np.asarray(Image.open(f'out/func/page_{p:02d}.png').convert('RGB')).astype(int)
    seed = a[sy, sx]
    m = np.abs(a - seed).sum(axis=2) < 14
    lab, _ = label(m)
    comp = lab == lab[sy, sx]
    ys, xs = np.where(comp)
    out[p] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    print(p, seed.tolist(), out[p], comp.sum())
json.dump(out, open('out/func/boxes.json', 'w'))
