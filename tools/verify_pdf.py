"""Verify the exported PDF: 90 pages, 16:9, every span of ref/content.json present
verbatim (whitespace ignored) on its page, and diagram images at full resolution."""
import json
import re
import sys

import fitz  # PyMuPDF

pdf_path = sys.argv[1] if len(sys.argv) > 1 else 'out/KuyayPet_Presentacion_UML.pdf'
content = json.load(open('ref/content.json', encoding='utf-8'))
doc = fitz.open(pdf_path)
errors = []
squash = lambda s: re.sub(r'\s+', '', s)

if doc.page_count != 90:
    errors.append(f'páginas: {doc.page_count} (esperado 90)')

for i, slide in enumerate(content[: doc.page_count]):
    page = doc[i]
    w, h = page.rect.width, page.rect.height
    if abs(w / h - 16 / 9) > 0.01:
        errors.append(f'p{i + 1}: proporción {w:.0f}x{h:.0f}')
    text = squash(page.get_text(sort=True))  # reading order (layout), not paint order
    for k, span in enumerate(slide['text']):
        if squash(span['t']) not in text:
            errors.append(f'p{i + 1} span {k}: falta {span["t"]!r}')
    # Diagram slides: the embedded image keeps the original pixel size.
    if 6 <= slide['slide'] <= 86:
        want = tuple(slide['images'][0]['px'])
        sizes = {(im[2], im[3]) for im in page.get_images(full=True)}
        if want not in sizes:
            errors.append(f'p{i + 1}: diagrama {want} no está a resolución completa (hay {sorted(sizes)})')

if errors:
    print('\n'.join(errors[:40]))
    print(f'FALLA: {len(errors)} problemas')
    sys.exit(1)
print(f'OK: {doc.page_count} páginas 16:9, texto literal y diagramas a resolución completa')
