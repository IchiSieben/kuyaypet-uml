# HANDOFF

## Estado (2026-09-25, tarde)
- `main` = v1-clase (Fase 1 + PDFs), desplegado en Hostinger y Pages. Ver ESTADO_CLASE.md.
- Rama `fase2`: animaciones de entrada, overlay de dibujo de diagramas, lupa, vista general (O), índice por HU (H), barra de progreso con marcas por HU, prefers-reduced-motion. `npm run check` = 18 pruebas en verde (check + anim).
- Ventana congelada 15:45–17:30: sin despliegues ni pushes a main.

## Pendiente
- Después de las 17:30: merge fase2 → main, redeploy Hostinger (zip de dist + purga de caché, mantener `.htaccess` no-transform), Pages sale solo por push, regenerar PDF y verificar con `npm run pdf`.
- Fase 3 (pulido gerencial) y Fase 4 restante (versión offline de un solo archivo).
