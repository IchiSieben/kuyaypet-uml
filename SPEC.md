# SPEC — KuyayPet · Presentación UML interactiva

## Entradas
- `ref/content.json` (90 láminas: spans de texto, imágenes, formas) — solo lectura.
- `ref/assets/*.png` (diagramas RGB sobre blanco; íconos RGBA 192/120 px) — solo lectura.
- `ref/slides/slide_NN.jpg` — referencia visual.

## Salidas
- `dist/` sitio estático (base `./`).
- `out/screens/slide_NN.png` (1920×1080) y `out/screens/1366/slide_NN.png`, hojas de contacto.
- `out/iconos_comparacion.png` — PNG original vs SVG, lado a lado.
- Fase 4: `dist-offline/KuyayPet_UML.html`, `out/KuyayPet_Presentacion_UML_interactiva.pdf`.

## Invariantes (verificadas por `npm run check`)
1. Exactamente 90 `[data-slide]`, en orden; la lámina N contiene el pie `KuyayPet  /  NN`.
2. Cada span de `content.json` aparece como elemento `[data-span]` con el mismo texto (normalizando solo espacios). Sin `text-transform` ni `content:` en CSS.
3. Láminas de HU (6–86): presente `PDF · p. N`; la imagen del diagrama, decodificada (URL o `data:` base64), tiene el mismo SHA-256 que `ref/assets/<archivo>`. Ningún PNG de diagrama pasa por optimizadores.
4. Íconos: pueden ser SVG; mismo significado y forma que el PNG (verificado a ojo con `out/iconos_comparacion.png`).
5. Solo se precargan los diagramas de la lámina actual y la siguiente.

## Pendiente para Fase 2 (acordado con el dueño)
- Overlay de dibujo: antes de potrace, eliminar componentes conectados pequeños (texto) y trazar solo cajas, líneas, flechas y lifelines; el texto aparece con el crossfade al PNG. Respaldo: máscara direccional.
- Diagramas ≥ 4:1: revisar a 1366×768; si el texto no se lee, reducir la cabecera solo en esas láminas. Nunca recortar.

## Fuera de alcance (Fase 1)
Animaciones, zoom/lupa, vista general, índice por HU, despliegue.
