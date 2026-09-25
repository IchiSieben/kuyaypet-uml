# Decisiones

## Fase 1 — base y fidelidad
- **Data-driven desde `content.json`**: ninguna lámina tiene texto escrito a mano; cada span del PDF se pinta una sola vez como `[data-span=i]`. Así el diseño puede cambiar libremente (flex/grid, Inter, jerarquía) sin riesgo de alterar una palabra, y el generador falla en build si un span queda sin usar o se usa dos veces.
- **Fidelidad garantizada por prueba, no por cuidado**: `npm run check` (Playwright sobre el build real) exige 90 láminas en orden, cada span literal (solo se normalizan espacios), que no haya texto fuera de los spans ni `text-transform`/`content:` en CSS, el pie `KuyayPet / NN`, `PDF · p. N` en las HU, SHA-256 de cada diagrama sobre los bytes decodificados (URL o `data:`) y que solo se precarguen la lámina actual y la siguiente.
- **Diagramas intactos**: Vite los emite tal cual (`assetsInlineLimit: 0`, sin optimizadores) y se muestran con `max-width/max-height` sobre una “hoja” (container queries), nunca recortados. Los ≥ 4:1 ganan 48 px por lado; a 1366×768 se leen, así que la cabecera no se redujo.
- **Íconos SVG**: redibujados en la cuadrícula de 24 u (trazo 1.5) de los originales; huella, corazón y persona se ajustaron por mínimos cuadrados a la línea media del PNG. `npm run icons` genera `out/iconos_comparacion.png` con IoU ≥ 0.87 en los 11.
