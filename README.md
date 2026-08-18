# Siteryo

Landing de arquitectura residencial y venta de inmuebles, construida como
"motion site": scroll suave, transiciones de entrada y micro-interacciones
en cada sección.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Motion](https://motion.dev) (antes Framer Motion) — transiciones de UI y gestos
- [GSAP](https://gsap.com) + ScrollTrigger — animaciones ligadas al scroll
- [Lenis](https://lenis.darkroom.engineering) — smooth scroll con inercia

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

- `src/components/SmoothScroll.tsx` — provider de Lenis, respeta `prefers-reduced-motion`
- `src/components/Preloader.tsx` — intro con contador (~1.2s) antes de revelar el sitio
- `src/components/Cursor.tsx` — cursor custom (punto + anillo) en desktop con puntero fino
- `src/components/MagneticButton.tsx` — wrapper de botón/enlace con atracción magnética al cursor
- `src/components/GrainOverlay.tsx` — textura de grano fija sobre todo el sitio
- `src/components/Hero.tsx` — hero a pantalla completa con parallax, fondo
  de vídeo real (`public/videos/hero-loop.mp4`/`.webm`, dolly de la villa
  con la piscina infinita, ida-vuelta para loop sin salto) en vez de una
  foto estática — cae a `/hero.jpg` con `prefers-reduced-motion`
- `src/components/CinematicReveal.tsx` — sección de dos escenas con el
  recorte (fondo transparente) de un vídeo real de la villa flotando sobre
  un fondo propio (gradiente + partículas ambientales), fijada con GSAP
  ScrollTrigger (`pin` sobre un layer `absolute`, no `position: sticky` —
  ver nota abajo) mientras el contenido (badges de cristal, titular, tarjeta
  de contacto, panel de "proceso") se desplaza por encima. Adaptado de un
  prompt de recreación de landing de IA (stack React/Tailwind) al contexto
  de Siteryo: mismo sistema de "glass" y reveals, copy y capas de contenido
  reescritos para arquitectura residencial. El fondo ya no es un degradado
  CSS plano: debajo del recorte hay una capa de vídeo real
  (`public/videos/ambient-loop.mp4`/`.webm`, el mismo metraje del hero, a
  480px y con `blur-2xl` + `saturate-150`) que aporta movimiento y luz
  cálida atmosférica sin distraer del texto — el degradado de color sigue
  ahí encima, pero con menos opacidad para dejarla pasar.
  **Nota de implementación (fit del recorte):** la villa usaba `object-fit:
  cover`, y como el metraje real hace dolly-in (la cámara se acerca en cada
  frame), la villa crecía hasta llenar el viewport y tapaba el titular en
  el momento clave del scroll. Se cambió a `contain` + escala fija (0.5) y
  anclaje inferior (0.56) para que se lea como un objeto flotante
  "grounded", con espacio para el texto alrededor.
  **Nota de implementación (sticky):** la primera versión usaba
  `position: sticky` + margen negativo para superponer el fondo al
  contenido; ese patrón resultó frágil (el navegador calculaba mal el punto
  de "despegue" del sticky, dejando el fondo visible sobre las secciones
  siguientes). Se sustituyó por `ScrollTrigger({ pin, pinSpacing: false })`
  sobre un layer `absolute`, igual que el resto de secciones pineadas del
  sitio.
  **Nota de implementación (recorte de vídeo):** ver §Vídeo abajo — los
  frames vienen de un vídeo generado con IA (Kling), no de una decodificación
  de `<video>` en runtime. La primera versión sí decodificaba un
  `hero-scrub.mp4` en vivo (poster → video → canvas con caché de frames
  offscreen); se abandonó ese enfoque porque el objetivo pasó a ser un
  recorte sin fondo, y aplicar `rembg` cuadro a cuadro solo tiene sentido
  como paso de preprocesado, no en el navegador del visitante.
- `src/components/FadeInView.tsx` — wrapper de reveal genérico
  (IntersectionObserver, `translate-y-8/opacity-0` → `translate-y-0/opacity-100`,
  700ms ease-out, delay configurable), usado dentro de `CinematicReveal`
- `src/components/RevealText.tsx` — reveal de titulares línea a línea con
  máscara `overflow-hidden`, reutilizado en Hero, Propiedades y Contacto
- `src/components/DistortImage.tsx` — distorsión líquida por shader WebGL2
  (sin dependencias — WebGL nativo) sobre la imagen de cada
  `PropertyCard` al pasar el cursor: desplazamiento radial + ripple
  centrado en el puntero, con `cover` fit calculado en el propio shader.
  Solo se activa con `(hover: hover) and (pointer: fine)` y
  `!prefers-reduced-motion`; cae a `next/image` normal en el resto de casos.
- `src/components/VideoLoopBackground.tsx` — loop de fondo tipo cinemagraph
  con `<video autoplay muted loop playsInline>` nativo en vez de una foto
  estática de card. Usado en "Ático Lumière" con
  `public/videos/card-loop-lumiere.mp4`. Cae a una imagen fija con
  `prefers-reduced-motion`. Cada `Property` puede activar esta card-loop
  declarando `loopVideo: "/videos/…mp4"` en `src/lib/properties.ts`.
  **Nota de implementación:** la primera versión decodificaba el vídeo a
  frames PNG/WebP y los dibujaba a mano en un `<canvas>` (mismo patrón que
  el hero). Se reemplazó por `<video>` nativo porque aquí no hace falta
  scroll-scrub frame a frame — es un loop continuo — así que el decodificador
  de hardware del navegador hace el trabajo mejor y con menos código que
  reimplementarlo. (El recorte de la villa en `CinematicReveal` sigue
  usando canvas + PNG porque ahí sí se necesita seek preciso ligado al
  scroll, y el seek de `<video>` no es suficientemente fino/estable para
  eso — ver nota de vídeo del hero abajo.)
- `src/components/CutoutParallaxReveal.tsx` — sección pineada con recorte
  (PNG sin fondo, fondo eliminado con un modelo de segmentación) de Casa
  Arena que "se construye" en escena mientras el terreno y el cielo cruzan
  de tono. Ya no está montada en `page.tsx` (reemplazada por
  `CinematicReveal`), pero el código queda disponible para reutilizar.
- `src/components/Properties.tsx` / `PropertyCard.tsx` — grid de propiedades
  con reveal por scroll (clip-path "curtain" en la imagen) y cursor de hover
- `src/components/Stats.tsx` — contadores animados al entrar en viewport
- `src/components/Contact.tsx` — formulario de contacto + footer
- `src/lib/gsap.ts` — registro centralizado del plugin ScrollTrigger
- `src/lib/useMediaQuery.ts` — hook de media query vía `useSyncExternalStore`
- `src/lib/properties.ts` — datos de las propiedades mostradas

Las imágenes en `public/properties/` y `public/hero.jpg` son fotografía real
con licencia libre (Unsplash). `public/grain.jpg` sigue siendo una textura de
grano generada, sin depender de bancos de imágenes externos.

`public/cutouts/casa-arena-cutout.png` es un recorte (fondo transparente) de
`public/properties/arena.jpg`, generado localmente con
[rembg](https://github.com/danielgatis/rembg) (modelo `isnet-general-use`) —
misma licencia que la foto original (Unsplash), sin depender de servicios
externos de recorte.

## Vídeo de fondo del Hero y capa ambiental de CinematicReveal

`public/videos/hero-loop.mp4`/`.webm` y `public/videos/ambient-loop.mp4`/`.webm`
vienen del mismo metraje real de Kling AI que el recorte (ver abajo), sin
recortar el fondo — es justo el fondo (piscina infinita, cielo de atardecer)
lo que se quiere mostrar aquí.

- **`hero-loop`** (1600px de ancho, ~6MB mp4 / ~3MB webm): fondo a pantalla
  completa del `Hero`, reemplazando la foto estática `hero.jpg`. Recortada
  la franja con la marca de agua de Kling, ida-vuelta (`reverse` + `concat`
  con `ffmpeg`) para que el `<video loop>` no salte al reiniciar.
- **`ambient-loop`** (480px de ancho — se sirve muy pequeño porque va con
  `blur-2xl`, así que la resolución no importa; ~550KB): misma técnica de
  ida-vuelta, colocada detrás del recorte de la villa en `CinematicReveal`
  como capa de luz y color en movimiento, sustituyendo lo que antes era un
  degradado CSS plano. El degradado de color sigue encima pero con menos
  opacidad, para dejar pasar el brillo del vídeo sin perder contraste con
  el texto.

Ambas caen a la imagen/gradiente estático con `prefers-reduced-motion`.

## Recorte de la villa en CinematicReveal: `public/frames/hero-cutout/`

38 PNG con transparencia (`f000.png`…`f037.png`, 1280px de ancho) que
`CinematicReveal` precarga y dibuja en un `<canvas>` según el progreso de
scroll — el mismo patrón de secuencia de frames que ya se usaba en el sitio,
pero ahora con fondo transparente en vez de JPG opaco.

**Procedencia:** generados a partir de un vídeo real hecho con
[Kling AI](https://klingai.com) (dolly + tracking shot de una villa, 5s,
1920×1080), del que se extrajeron los primeros ~3.2s (76 frames a 24fps,
luego reducidos a 38 tomando uno de cada dos) y se les quitó el fondo con
`rembg` (`isnet-general-use`) cuadro a cuadro.

**Por qué solo 3.2s del clip de 5s:** el recorte funciona muy bien mientras
hay cielo/fondo real que quitar (plano abierto, tracking lateral), pero se
rompe por completo en el primer plano final del clip — ahí toda la imagen
es interior (paredes, puerta, suelo), no hay "fondo" que segmentar y el
modelo devuelve casi todo transparente. Se verificó frame a frame antes de
elegir el punto de corte (frame 75 limpio, frame 85 ya roto).

**Licencia:** revisa los términos de la cuenta gratuita de Kling antes de
usar este asset en producción — el tier gratis restringe el uso a no
comercial en la mayoría de planes. Si el sitio va a producción real, genera
el vídeo con una cuenta que cubra uso comercial.

**Para regenerar con un vídeo nuevo:** repite el proceso (extraer frames →
`rembg` cuadro a cuadro → recortar antes de que la cámara entre a interior →
reemplazar los PNG en `public/frames/hero-cutout/`). El componente no
necesita cambios si el número de frames es distinto — ajusta `FRAME_COUNT`
al inicio de `CinematicReveal.tsx`.

## Loop de fondo: `public/videos/card-loop-lumiere.mp4`

Vídeo real (no frames sueltos) de una cortina de lino moviéndose con
suavidad, generado con Kling AI (5s, 1920×1080). A diferencia del hero, aquí
**no hace falta quitar el fondo** — el clip entero es el fondo de la card —
así que el procesado fue solo: recortar la franja inferior (llevaba la marca
de agua de Kling), reescalar a 960px de ancho y construir con `ffmpeg` un
clip ida-vuelta (`reverse` + `concat`) para que el loop del `<video loop>`
cierre exactamente en el mismo frame de inicio/fin, sin salto ni crossfade
necesario — el navegador hace el resto con su decodificador de vídeo. H.264
1.2MB, `-movflags +faststart` para que arranque antes de descargarse entero.
Mismo aviso de licencia que el vídeo del hero: revisa los términos de la
cuenta de Kling antes de producción.

## Identidad de marca

`src/app/favicon.ico`, `public/icon-192.png`, `public/icon-512.png` y
`public/apple-touch-icon.png` son un monograma "S" (Liberation Serif,
`--accent` sobre `--foreground`) generado localmente para reemplazar el
triángulo por defecto de Next.js — antes el sitio no tenía favicon de marca.
`src/app/layout.tsx` referencia estos iconos y añade metadatos Open
Graph/Twitter (título, descripción, `/hero.jpg` como imagen) y
`theme-color`. `globals.css` define `::selection` y el color de la
scrollbar con `--accent`, en vez de dejar los valores por defecto del
navegador.
