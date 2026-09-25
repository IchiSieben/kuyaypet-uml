# KuyayPet · Presentación UML interactiva — reglas de cada sesión

Convertir la presentación del equipo (`ref/KuyayPet_Presentacion_UML.pdf`, 90 láminas 16:9, exportada de PowerPoint) en una **presentación web interactiva**, elegante y de nivel gerencial, donde cada lámina **se dibuja** al entrar. Curso Ingeniería de Software, UPCH 2026-2.

## Regla de oro: CERO cambios de contenido
El equipo ya armó y revisó el contenido. Se rediseña la **forma**, jamás el **fondo**.
- Todo texto de cada lámina se conserva **literal** (mismas palabras, tildes, mayúsculas, signos, «comillas», “PDF · p. N”, numeración “Vista 1 de 3”). No reescribir, no resumir, no traducir, no corregir erratas (si ves una, anótala en `docs/observaciones.md` para que el equipo decida).
- Mismo orden y misma cantidad de láminas (90). No agregar ni quitar láminas.
- Los diagramas UML son las imágenes originales de `ref/assets/` (no redibujarlos a mano, no recortarlos de forma que se pierda información, no editarlos).
- Permitido añadir **solo cromo de navegación** que no afirma nada nuevo: barra de progreso, índice/miniatura de HU, número de lámina, chip de la vista (derivado del texto que ya existe), controles. Nada de notas del orador, frases, datos o títulos inventados.
- `npm run check` (obligatorio antes de cada commit): extrae el texto renderizado de cada lámina y lo compara con `ref/content.json` (normalizando solo espacios); compara el hash de cada imagen de diagrama con el original. Si difiere, el build falla.

## Fuentes (solo lectura — nunca editar `ref/`)
| archivo | qué es |
|---|---|
| `ref/KuyayPet_Presentacion_UML.pdf` | la presentación original (fuente de verdad) |
| `ref/content.json` | por lámina: cada span de texto con fuente, tamaño (pt), color y bbox en puntos (lienzo 960×540); imágenes con bbox; formas vectoriales |
| `ref/INDICE_LAMINAS.md` | índice: título, vista (Caso de Uso / Actividades / Secuencia / Componentes / Colaboración) y tipo de cada lámina |
| `ref/slides/slide_NN.jpg` | render de referencia de cada lámina original (para comparar visualmente) |
| `ref/assets/img_NNN_sNN.png` | imágenes originales extraídas (diagramas UML ~2000–2800 px; íconos 192 px con transparencia) |
| `ref/KuyayPet_Colaboracion_HU01-HU26.mdj` | modelo StarUML (solo diagramas de colaboración) — referencia opcional |

## Identidad visual (la del equipo, refinada)
Paleta tomada del PDF — mantenerla, solo afinar matices/transparencias:
navy `#102D47` (títulos, fondos oscuros) · azul `#247CAA` (subtítulo de vista, acentos) · celeste `#A9DDF0` (sobre navy, números grandes) · ámbar `#E5A16A` (numerales 01/02/03, corazón) · pizarra `#517084` (texto secundario) · blanco.
- Tipografía: sustituir Arial por una sans profesional autoalojada (p.ej. Inter o Manrope; cifras tabulares para 26 / 5 / 130 / 52). Jerarquía fija: título de lámina, subtítulo de vista, línea de actor · objetivo, cuerpo, pie.
- Estética gerencial: mucho aire, grilla consistente, sin adornos que no carguen información (Tufte data-ink). Láminas navy con un degradado/grano muy sutil; láminas claras sobre blanco cálido. Diagramas sobre una “hoja” con sombra suave y esquinas redondeadas, centrados, al máximo tamaño legible.
- Íconos (huella, corazón, chat, campana, pin, calendario, check, persona, escudo): versión SVG de trazo equivalente a los originales, mismo significado y color, para poder animarlos.
- Sin modo oscuro alternativo; el tema es el de la presentación.

## Interacción y animación
- Cada lámina **se dibuja al entrar**: títulos con revelado suave, íconos con trazo que se dibuja (stroke-dashoffset), cifras grandes con conteo (0 → 26 / 5 / 130 / 52), listas numeradas y flechas del “Flujo general” en secuencia, líneas del esquema “Relación entre modelos UML” trazándose hacia el centro.
- **Diagramas**: efecto de dibujo sin tocar el original → en build, vectorizar cada PNG de diagrama (p.ej. `potrace` en Node) solo para un **overlay de animación** (los trazos se dibujan en 1.2–2 s siguiendo la dirección de lectura), y al terminar hacer crossfade a la imagen PNG original, que es lo que queda en pantalla. Si la vectorización queda fea en algún tipo de diagrama, usar en su lugar una revelación por máscara direccional (izq→der para casos de uso/componentes, arriba→abajo para actividades/secuencia). Clic sobre el diagrama = zoom/lupa a pantalla completa (para leer detalles en el proyector).
- Duraciones cortas y sobrias (≤ 2 s por lámina, easing suave); una tecla/clic salta la animación. Respetar `prefers-reduced-motion` (sin animación, estado final directo).
- Navegación: ← → / espacio / rueda / swipe; `O` vista general en grilla de miniaturas; `F` pantalla completa; `G` + número para ir a lámina; `H` índice por HU (26 entradas → primera lámina de esa HU); deep link `#/12`. Barra de progreso fina con marcas por HU.
- Escalado: lienzo lógico 1920×1080 que escala a cualquier pantalla sin deformarse (letterbox).

## Stack
- Vite + TypeScript, sin framework pesado. Las 90 láminas se generan **desde `ref/content.json`** con ~9 plantillas: portada, “¿Qué es?”, cifras, actores, criterio, lámina de HU con diagrama (81 láminas), flujo general, relación de modelos, conclusiones, gracias. Las posiciones del PDF guían la composición, pero la maquetación es nuestra (flex/grid), no absoluta pixel a pixel.
- Animación: GSAP (verificar licencia actual al instalar) o Motion; sin librerías de slides que impongan su estética.
- Fuentes e imágenes autoalojadas: **la presentación debe funcionar sin internet en el aula**.
- Salidas:
  1. `dist/` — sitio estático (base relativa `./`).
  2. `dist-offline/KuyayPet_UML.html` — un solo archivo autocontenido (vite-plugin-singlefile) para llevar en USB y abrir con doble clic.
  3. `out/KuyayPet_Presentacion_UML_interactiva.pdf` — exportación a PDF de 90 páginas con el estado final de cada lámina (Playwright), por si el profesor pide PDF.

## Repositorio y despliegue
- Repo GitHub propio `kuyaypet-uml` (con `gh`), commits en español, pequeños.
- Publicación: GitHub Pages (Actions) + un **subdominio gratuito propio de Hostinger** (`*.hostingersite.com`, orden `1008316349`), distinto al de la app KuyayPet para que los despliegues no se pisen. Flujo MCP: `hosting_generateAFreeSubdomainV1` → `hosting_createWebsiteV1` → esperar en `hosting_listWebsitesV1` → zip de `dist/` → `hosting_deployStaticSiteArchiveV1`. Guardar URLs en `DEPLOY.md`.
- Nunca escribir fuera de esta carpeta. `../Kuyaypet_ingsoft` (la app) es solo lectura.

## Verificación visual (antes de decir “listo”)
- Playwright a 1920×1080 y 1366×768: captura del estado final de cada lámina en `out/screens/slide_NN.png` y hoja de contacto `out/screens/contact.png`. **Mirar** la hoja y compararla con `ref/slides/` (mismo contenido, mejor forma).
- `npm run check` en verde. Sin texto cortado ni diagrama ilegible en 1366×768.
- Checklist gerencial por lámina: se entiende en 3 s; ≤ 6 elementos compitiendo; nada de texto < 14 px efectivos en 1080p (salvo pie y “PDF · p. N”); cada color significa lo mismo en todo el deck.

## Forma de trabajar
- iC7 (Yoichi) quiere aprender: al cerrar cada fase, 3–5 líneas sobre las decisiones (por qué data-driven desde content.json, cómo funciona el overlay de dibujo, cómo se garantiza la fidelidad) en `docs/decisiones.md`.
- Preguntas al dueño: en un solo mensaje por fase; si no responde, seguir con la opción más conservadora con el contenido.
- Host Windows: scripts npm, rutas con `/` en configs.
