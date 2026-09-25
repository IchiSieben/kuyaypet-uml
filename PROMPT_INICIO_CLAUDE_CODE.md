# Prompt de arranque — pegar en Claude Code abierto en `Kuyaypet_presentacion_uml`

> Sesión nueva e independiente de la app. Recomendado: Opus (esfuerzo alto) — es un trabajo de diseño.

---

Quiero convertir nuestra presentación de UML de KuyayPet (`ref/KuyayPet_Presentacion_UML.pdf`, 90 láminas) en una **presentación web interactiva** que se vea muy profesional, elegante y llamativa —nivel gerencial— donde **cada lámina se dibuja al entrar**. El contenido lo armó y revisó el equipo: **no se toca ni una palabra, ni el orden, ni los diagramas**; solo mejoramos la forma y añadimos interacción.

0. Descomprime las referencias dentro de `ref/`: `tar -xf ref/assets.zip -C ref` y `tar -xf ref/slides.zip -C ref` (quedan `ref/assets/` y `ref/slides/`; luego puedes borrar los .zip). Agrega los .zip al `.gitignore`.
1. Lee `CLAUDE.md` (reglas, identidad visual, animación, stack, despliegue) y `ref/INDICE_LAMINAS.md`. Mira las referencias `ref/slides/slide_01, 02, 03, 04, 05, 06, 13, 17, 19, 87, 88, 89, 90.jpg` para entender las 9 plantillas.
2. Antes de programar, dame en ≤ 12 líneas: plantillas que detectaste, propuesta de dirección visual (tipografía, tratamiento de fondo navy/blanco, “hoja” de diagrama), cómo harás el efecto de dibujo de diagramas, y bloqueos (Node, gh, MCP de Hostinger).
3. **Fase 1 — base y fidelidad**: proyecto Vite+TS, `git init`, repo `kuyaypet-uml` con `gh`. Generador de láminas desde `ref/content.json`, las 9 plantillas sin animación todavía, navegación completa, escalado 16:9, fuentes autoalojadas, y `npm run check` (texto literal + hash de diagramas) en verde. Capturas + hoja de contacto; compárala con `ref/slides/` y dime qué ves.
4. **Fase 2 — que se dibuje**: animaciones de entrada por plantilla (íconos con trazo, conteo de cifras, flujo y relación de modelos trazándose) y el overlay de dibujo de diagramas con crossfade al PNG original; zoom/lupa en diagramas; vista general (`O`), índice por HU (`H`), barra de progreso con marcas por HU; `prefers-reduced-motion`.
5. **Fase 3 — pulido gerencial**: pasada de diseño lámina por lámina con el checklist de `CLAUDE.md` mirando las capturas (no el código). Ajustar ritmo de animaciones para exponer (≤ 2 s, se puede saltar).
6. **Fase 4 — entregables y despliegue**: `dist/`, versión offline de un solo archivo (`dist-offline/KuyayPet_UML.html`), PDF exportado de 90 páginas, GitHub Pages + subdominio gratuito propio de Hostinger. Verifica ambas URLs con Playwright y dame los links.

Detente al final de la Fase 1 para que yo vea la dirección visual antes de animar todo. Si encuentras erratas en el contenido, **no las corrijas**: anótalas en `docs/observaciones.md`.
