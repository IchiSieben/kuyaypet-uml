# Estado para la clase — 25/09/2026

## Links
| Qué | URL |
|---|---|
| Presentación en Hostinger (subdominio propio, no el de la app) | https://deepskyblue-toad-157997.hostingersite.com/ |
| Presentación en GitHub Pages | https://ichisieben.github.io/kuyaypet-uml/ |
| PDF del deck UML (90 láminas) en el sitio | https://deepskyblue-toad-157997.hostingersite.com/KuyayPet_Presentacion_UML.pdf |
| PDF Funcionalidades con prototipo (20 págs.) en el sitio | https://deepskyblue-toad-157997.hostingersite.com/KuyayPet_Funcionalidades_Principales.pdf |
| Drive · PDF Funcionalidades con prototipo | https://drive.google.com/open?id=1NOk3SdLv5pNfmYjvljE_qOrrEbmZvbRL |
| Drive · PDF deck UML | https://drive.google.com/open?id=1WhZQtHrECcr2ogmNm4g9Qb6b2C-JmyI8 |
| Drive · carpeta (PDFs + respaldo `git bundle`) | https://drive.google.com/open?id=1EGFmZzzjxLW8QTzVPae3Fyf-0anR05bZ |

Carpeta de Drive: `Gdrive:02-Proyectos/produccion/kuyaypet/presentacion-uml/` (la misma de la app, `produccion/kuyaypet/`).
Los mismos PDF están también en Pages: `https://ichisieben.github.io/kuyaypet-uml/KuyayPet_Presentacion_UML.pdf` y `.../KuyayPet_Funcionalidades_Principales.pdf`.

## Hecho (verificado)
- **15:16 · PDF del deck** `out/KuyayPet_Presentacion_UML.pdf`: 90 páginas 16:9, texto seleccionable, diagramas a resolución completa. `tools/verify_pdf.py` confirma 90 págs. y todo el texto de `ref/content.json`.
- **15:22 · PDF Funcionalidades con prototipo** (`out/KuyayPet_Funcionalidades_Principales_con_prototipo.pdf`, 20 págs.): capturas reales en marco de celular sobre el área interna de cada recuadro (p5–p16) y logo de la app en p1 y p20. La imagen original de cada página no se modificó: las capturas son imágenes superpuestas. La barra “PROTOTIPO WEB” queda visible.
- **15:30 · Publicado** en Hostinger y en GitHub Pages (versión Fase 1, sin animaciones). Verificado con Playwright: 90 láminas, diagrama a 2052 px, ambos PDF con HTTP 200 y `%PDF`; hash SHA-256 de los 81 diagramas idéntico en ambos sitios.
- Tag `v1-clase`.
- **16:11 · Fase 2 lista en la rama `fase2`** (sin desplegar por la ventana congelada): láminas que se dibujan, lupa, vista general (O), índice por HU (H), barra de progreso con marcas por HU. 18 pruebas en verde. Merge y redespliegue después de las 17:30.
- 16:25 · Corregido en `fase2`: en la lámina 87 el paso “Conversar” no se animaba (selector ambiguo `d`/`dn`).

## Problemas y decisiones
- La CDN de Hostinger recomprimía los PNG de diagramas a WebP (reducidos a 1600 px). Se corrigió con `.htaccess` `Cache-Control: no-transform` y purga de caché; ahora los bytes son idénticos.
- Capturas con avisos flotantes encima (“Sesión cerrada” en admin, “Hola, Rosa” en responsable): se usaron recortes por debajo del aviso, sin retomar capturas.
- p13: el recuadro dice “Publicar mascota”, pero se puso la pantalla del responsable (“Hola, Rosa”: mascotas, interesados, solicitudes), según lo pedido.
- Los recuadros bajos (p9, p13, p14, p15) llevan 3 recortes lado a lado, cada uno con una tarjeta completa, para que se lean.

## Siguiente
- 15:45–17:30: congelado, sin despliegues. Fase 2 en la rama `fase2`.
