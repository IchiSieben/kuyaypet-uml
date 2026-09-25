# Tema «Kuyay» — versión divertida y vendible de la presentación UML

> Se suma al plan autónomo. La versión sobria («gerencial») se queda tal cual; esto es un **segundo tema** del mismo deck.

**Prioridad y horario (sin pedir aprobación):**
1. Primero termina lo ya pedido: PDF sobrio + publicación + Drive antes de las 15:45.
2. Luego el tema Kuyay en la rama `tema-kuyay`. Si está completo y `npm run check` pasa antes de las 15:45, publícalo también; si no, publícalo después de las 17:30 (ventana congelada 15:45–17:30).
3. Anota avances en `ESTADO_CLASE.md`.

## Qué es
El mismo contenido (90 láminas, textos literales, mismos diagramas, mismo orden) con la **identidad de la app KuyayPet**: cálida, con fotos de mascotas y las pantallas reales de la app, para que la presentación **venda** el producto. Se elige con la tecla `T`, un botón en la barra y la URL `?tema=kuyay`. También hay que exportar un PDF de este tema: `out/KuyayPet_Presentacion_UML_Kuyay.pdf`.

## Qué se permite en este tema (y qué no)
- **Permitido:** imágenes decorativas y de producto (fotos de mascotas, capturas de la app, logo, ilustraciones), transiciones divertidas y rótulos cortos de cromo marcados con `data-chrome` (p.ej. «Así se ve en la app», «Probar en vivo →»). El check ignora solo los nodos `data-chrome`; todo el resto sigue validándose literal.
- **Prohibido:** cambiar, añadir o quitar texto de contenido; tapar, recortar o achicar los diagramas por debajo de lo legible; inventar datos, métricas o testimonios.

## Recursos (copiar, no enlazar; `../Kuyaypet_ingsoft` es solo lectura)
- Fotos de mascotas y personas ya curadas de la app: `../Kuyaypet_ingsoft/public/img/` (respeta sus créditos en `CREDITS.md`).
- Logo, paleta y tipografías de la app (`tailwind.config.js`, `src/`): crema, terracota, coral del «Me gusta», verde salvia; Baloo 2 / Nunito / Caveat.
- Capturas reales por HU: `../Kuyaypet_ingsoft/docs/screenshots/` (si falta alguna HU, genérala con Playwright contra https://firebrick-cod-910257.hostingersite.com/ en viewport 390×844 y guárdala aquí).

## Ideas de diseño (en este orden de impacto)
1. **Cada lámina de HU con su pantalla real:** a la derecha del diagrama (o como polaroid que entra girando) va la captura del celular de esa HU dentro de un marco de teléfono, con «Así se ve en la app». Al hacer clic, se abre la demo en vivo en esa pantalla. El diagrama sigue siendo el protagonista y se mantiene legible; en láminas con diagrama muy ancho, la polaroid va pequeña en una esquina o aparece al pasar el mouse.
2. **Portada y cierre:** collage de fotos de perros y gatos, logo animado (perro y gato asomándose) y el tagline de la app como cromo. En «Gracias», confeti de huellas y corazones.
3. **Transición entre láminas tipo swipe:** la lámina sale como carta de Tinder (derecha = avanzar, izquierda = retroceder), con una leve rotación.
4. **Actores con mascota:** en la lámina 04 y en la línea de actor de cada HU, un avatar circular de persona/mascota del dataset según el rol (Adoptante, Responsable, Usuario, Admin), siempre el mismo por rol.
5. **Cifras (26 / 5 / 130 / 52):** conteo animado con huellitas que «caminan» hasta el número.
6. **Barra de progreso como camino de huellas** con marcas por HU; al pasar sobre una HU de Match (HU-07), un corazón que late.
7. **Flujo general (87):** cada paso con una miniatura de la pantalla real correspondiente.
8. **Diagramas:** hoja blanca con esquinas redondeadas y cinta adhesiva de papel, sobre fondo crema con patrón muy suave de huellas. El efecto de dibujo de la Fase 2 aplica igual.

## Verificación
- `npm run check` en verde en **ambos** temas (texto literal, hashes de diagramas, límites a 1920×1080 y 1366×768).
- Hojas de contacto de ambos temas y comparación lado a lado en `out/screens/kuyay/`.
- Legibilidad: ningún diagrama más pequeño que en el tema sobrio.
