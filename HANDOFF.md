# HANDOFF

## Estado (2026-09-25)
- Fase 1 terminada: Vite+TS, 90 láminas generadas desde `ref/content.json` (9 plantillas en `src/slides.ts`), navegación (← → espacio rueda swipe, F, G+nº+Enter, `#/N`), escalado 1920×1080 con letterbox, Inter autoalojada.
- `npm run check` verde (3 pruebas). `npm run icons` → `out/iconos_comparacion.png`. `npm run screens` → `out/screens/` (1920) y `out/screens/1366/`, hojas `contact*.png`.
- Esperando revisión visual del dueño antes de la Fase 2.

## Siguiente (Fase 2) — ver SPEC.md “Pendiente para Fase 2”
- Overlay de dibujo: quitar componentes conectados pequeños (texto) antes de potrace; crossfade al PNG. Respaldo: máscara direccional.
- Clic en diagrama = zoom (hoy el clic avanza/retrocede por tercios en `src/main.ts`; cambiar sobre `.sheet`).
- Vista general `O`, índice `H`, barra de progreso con marcas por HU, prefers-reduced-motion.
