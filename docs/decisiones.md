# Decisiones

## Fase 1 — base y fidelidad
- **Data-driven desde `content.json`**: ninguna lámina tiene texto escrito a mano; cada span del PDF se pinta una sola vez como `[data-span=i]`. Así el diseño puede cambiar libremente (flex/grid, Inter, jerarquía) sin riesgo de alterar una palabra, y el generador falla en build si un span queda sin usar o se usa dos veces.
- **Fidelidad garantizada por prueba, no por cuidado**: `npm run check` (Playwright sobre el build real) exige 90 láminas en orden, cada span literal (solo se normalizan espacios), que no haya texto fuera de los spans ni `text-transform`/`content:` en CSS, el pie `KuyayPet / NN`, `PDF · p. N` en las HU, SHA-256 de cada diagrama sobre los bytes decodificados (URL o `data:`) que solo se precarguen la lámina actual y la siguiente, y que ningún span quede fuera de la lámina a 1920×1080 ni a 1366×768 (el `textContent` no ve el recorte por `overflow`).
- **Diagramas intactos**: Vite los emite tal cual (`assetsInlineLimit: 0`, sin optimizadores) y se muestran con `max-width/max-height` sobre una “hoja” (container queries), nunca recortados. Los ≥ 4:1 ganan 48 px por lado; a 1366×768 se leen, así que la cabecera no se redujo.
- **Íconos SVG**: redibujados en la cuadrícula de 24 u (trazo 1.5) de los originales; huella, corazón y persona se ajustaron por mínimos cuadrados a la línea media del PNG. `npm run icons` genera `out/iconos_comparacion.png` con IoU ≥ 0.87 en los 11.

## Publicación v1-clase
- La CDN de Hostinger transforma imágenes (PNG→WebP reducido). Un `Cache-Control: no-transform` en `.htaccess` lo desactiva; la fidelidad se comprueba con el hash de los 81 diagramas servidos, no solo en local.
- PDF del deck: modo `?print` que apila las 90 láminas a 1920×1080 y `page.pdf` de Chromium; el texto queda seleccionable. La verificación extrae el texto en orden de lectura (`sort=True`) porque el orden de pintado del PDF no siempre sigue la lectura.
- La vista “Actividades · Vista 1 de 3” ya no se parte en dos pesos: así el texto copiado del PDF sale en orden.
- Funcionalidades con prototipo: la página original queda intacta; las capturas y el logo se insertan como imágenes aparte (PyMuPDF) sobre el área interna detectada por relleno desde una semilla. La opción más conservadora con el contenido del equipo.
