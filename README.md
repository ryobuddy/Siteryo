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
- `src/components/Nav.tsx` — nav fijo con scrollspy (`IntersectionObserver`
  sobre las secciones de cada link, banda `-45%/-50%` del viewport):
  resalta el link de la sección visible en vez de quedarse "mudo".
  Antes "Estudio" y "Proceso" apuntaban a `href="#"` — ahora enlazan a
  `#estudio` (Stats) y `#proceso` (segunda escena de `CinematicReveal`).
- `src/components/Preloader.tsx` — intro con contador (~1.2s) antes de revelar el sitio
- `src/components/Cursor.tsx` — cursor custom (punto + anillo) en desktop con puntero fino
- `src/components/MagneticButton.tsx` — wrapper de botón/enlace con atracción magnética al cursor
- `src/components/GrainOverlay.tsx` — textura de grano fija sobre todo el sitio
- `src/components/GuidedTour.tsx` — tour guiado de la interfaz (no 3D): un
  botón flotante abre un recorrido de 4 pasos con spotlight (recorte vía
  `box-shadow` sobre el elemento objetivo) + panel fijo con
  título/descripción/paso actual. Se descartó un recorrido 3D/360°
  porque no hay fotos 360° ni modelos `.glb` reales de las propiedades —
  fabricarlos habría sido peor que no tenerlos. Usa `lenisRef` (ver
  `src/lib/lenis.ts`) para el scroll animado entre pasos, ya que Lenis
  fuerza `scroll-behavior: auto` y el `window.scrollTo({behavior:"smooth"})`
  nativo no anima mientras Lenis está activo. Accesible: `role="dialog"`,
  foco atrapado en el panel, `Escape`/flechas para navegar, foco devuelto
  al botón disparador al cerrar, y respeta `prefers-reduced-motion`. Solo
  se monta en `/` — sus pasos apuntan a secciones que no existen en
  `/propiedades/[id]`.
- `src/components/Hero.tsx` — hero a pantalla completa con parallax y
  fondo animado atado al scroll (ver `ScrollScrubVideo` abajo) en vez de
  una foto estática — cae a `/hero.jpg` con `prefers-reduced-motion`.
  **Nota de implementación (scroll-driven, no autoplay):** el prompt de
  referencia original pedía explícitamente "motion is scroll-driven
  only", nada de loop automático — una versión intermedia usaba
  `<video autoplay loop>`, que lo contradecía directamente. Se pasó por
  una secuencia de 41 frames en `<canvas>` (mismo patrón que la villa de
  `CinematicReveal`) y finalmente se simplificó a lo que ya trae GSAP de
  fábrica para esto: animar `video.currentTime` contra el progreso de
  ScrollTrigger — la técnica documentada de la propia librería para este
  caso, sin frames ni canvas propios. Sin scroll, el fondo no se mueve
  (verificado con diff de píxeles entre capturas sin scrollear).
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
  frames vienen de preprocesar un vídeo real (antes generado con IA/Kling,
  ahora un clip de stock de Pexels) con `rembg`, no de una decodificación
  de `<video>` en runtime. La primera versión sí decodificaba un vídeo
  fuente en vivo (poster → video → canvas con caché de frames offscreen,
  un archivo distinto al `hero-scrub.mp4` actual del `Hero` — nombre
  reutilizado, sin relación); se abandonó ese enfoque porque el objetivo
  pasó a ser un recorte sin fondo, y aplicar `rembg` cuadro a cuadro solo
  tiene sentido
  como paso de preprocesado, no en el navegador del visitante.
- `src/components/FadeInView.tsx` — wrapper de reveal genérico
  (IntersectionObserver, `translate-y-8/opacity-0` → `translate-y-0/opacity-100`,
  700ms ease-out, delay configurable), usado dentro de `CinematicReveal`
- `src/components/RevealText.tsx` — reveal de titulares línea a línea con
  máscara `overflow-hidden`, reutilizado en Hero, Propiedades y Contacto
- `src/components/ScrollScrubVideo.tsx` — el fondo del Hero: un `<video>`
  normal (`public/videos/hero-scrub.mp4`/`.webm`, ver §Vídeo abajo), sin
  `autoplay` ni `loop`, cuyo `currentTime` se anima con
  `gsap.to(video, { currentTime: video.duration, scrollTrigger: {...} })`
  — la técnica documentada por GSAP para este caso exacto. Reemplaza a un
  `WebGLScrollHero` anterior (41 frames WebP precargados y dibujados a
  mano en `<canvas>` con un shader propio para distorsión/grano): mismo
  resultado — el fondo solo se mueve si scrolleás — con mucho menos
  código, dejando que el decodificador de vídeo del navegador haga el
  trabajo de interpolar entre frames en vez de simularlo con crossfade
  de texturas. Cae a `/hero.jpg` estático con `prefers-reduced-motion`.
- `src/components/AmbientImage.tsx` — reemplaza a `DistortImage`. La
  diferencia no es cosmética: `DistortImage` solo se movía al pasar el
  cursor (quieta el resto del tiempo); `AmbientImage` anima sola, todo el
  tiempo, con un shader WebGL2 propio (sin dependencias) que combina un
  ripple tipo líquido continuo (dos ondas seno/coseno en función de
  `uTime`), un zoom lento tipo Ken Burns que oscila (`uTime * 0.1`) y
  grano animado — el cursor solo añade un ripple extra encima en
  dispositivos con puntero, no es la fuente del movimiento. Usada en las
  3 cards sin vídeo propio (Casa Arena, Villa Oliva, Loft Bruma). Al ser
  animación continua (no solo hover), se activa en todos los
  dispositivos — pausa el `requestAnimationFrame` fuera de viewport vía
  `IntersectionObserver` para no quemar GPU en cards que no se ven, y cae
  a `next/image` estática con `prefers-reduced-motion` o si WebGL2 no
  está disponible.
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
  con reveal por scroll (clip-path "curtain" en la imagen) y cursor de hover.
  Bento de 3 columnas en desktop: una card grande (`size: "large"`, Casa
  Arena) a la izquierda ocupando 2 filas, dos pequeñas apiladas a la
  derecha (misma altura combinada que la grande) y un banner ancho
  (`size: "banner"`, Loft Bruma) a todo el ancho debajo. **Nota:** la
  versión anterior tenía 4 columnas con dos cards "large" — como ambas
  tenían la misma altura pero una empezaba una fila más abajo que la
  otra (por las dos cards pequeñas intercaladas), dejaban un hueco vacío
  grande debajo de la primera. El bento de 3 columnas con un tamaño
  "banner" distinto para la segunda evita ese desajuste de raíz en vez
  de parchearlo con alturas fijas.
- `src/components/Stats.tsx` — contadores animados al entrar en viewport
- `src/components/Contact.tsx` — formulario de contacto + footer. El
  formulario es funcional (antes solo hacía `preventDefault()` y no
  enviaba nada): valida en cliente, llama a `POST /api/contact`
  (`src/app/api/contact/route.ts`) y muestra estado de envío/éxito/error.
  **Sin proveedor de email/CRM configurado** — la ruta valida y hace
  `console.log` del lead en el servidor; para producción hay que
  sustituirlo por un envío real (Resend, Postmark, un webhook al CRM…).
- `src/app/not-found.tsx` — 404 de marca (antes caía en la genérica de
  Next), con vuelta al inicio.
- `src/lib/gsap.ts` — registro centralizado del plugin ScrollTrigger
- `src/lib/useMediaQuery.ts` — hook de media query vía `useSyncExternalStore`
- `src/lib/properties.ts` — datos de las propiedades mostradas. Sin precio
  ni superficie: son fotos de stock (Unsplash) sobre inmuebles que no
  existen como tal, así que mostrar cifras concretas (`€2.450.000`,
  `480 m²`) sería presentar como reales datos inventados. Cada propiedad
  solo lleva nombre, ubicación y una `description` de una frase, estilo
  editorial y no verificable (nunca superficie/precio), que sí se puede
  escribir con libertad creativa sin fingir un dato factual.
- `src/app/propiedades/[id]/page.tsx` — ficha de propiedad (rutas
  estáticas vía `generateStaticParams`, una por cada id en
  `properties.ts`): hero con la misma imagen/vídeo de la card, título con
  `RevealText`, párrafo de descripción, aviso explícito de que es una
  ficha de referencia, CTA a `/#contacto`, y un grid de "Otras
  propiedades". Antes las cards no llevaban a ningún sitio (`href="#"`);
  ahora `PropertyCard` usa `next/link` hacia esta ruta.

Las imágenes en `public/properties/` y `public/hero.jpg` son fotografía real
con licencia libre (Unsplash). `public/grain.jpg` sigue siendo una textura de
grano generada, sin depender de bancos de imágenes externos.

`public/cutouts/casa-arena-cutout.png` es un recorte (fondo transparente) de
`public/properties/arena.jpg`, generado localmente con
[rembg](https://github.com/danielgatis/rembg) (modelo `isnet-general-use`) —
misma licencia que la foto original (Unsplash), sin depender de servicios
externos de recorte.

## Fondo del Hero: `public/videos/hero-scrub.mp4`

Vídeo real de stock (no generado por IA): "Modern Luxury House with
Infinity Pool View", de [Pexels](https://www.pexels.com) (licencia
Pexels — libre para uso comercial, sin atribución obligatoria), 4K
original reescalado a 1600px de ancho. Se eligió por encima del metraje
de Kling AI porque es un plano real con movimiento de cámara tipo
dolly/orbit alrededor de una piscina infinita — misma línea estética
(arquitectura contemporánea, blanco, piscina, cielo despejado) sin
depender de generación por IA para esta pieza. `-movflags +faststart`
para que el seek funcione bien apenas carga, ya que el `currentTime` se
anima directamente contra el scroll (ver `ScrollScrubVideo` arriba) —
sin eso, el navegador tendría que descargar de más para poder saltar a
mitad del archivo. Solo MP4 (H.264 es soportado de forma nativa en todos
los navegadores relevantes) — se probó también WebM/VP9, pero para este
clip de 60fps con mucho movimiento el VP9 salió más pesado que el H.264
(22MB vs 10MB), así que no había motivo real para mantener el segundo
formato.

`public/videos/ambient-loop.mp4` (capa de luz difuminada detrás del recorte
de la villa en `CinematicReveal`) viene del mismo clip de Pexels que el
hero — no de Kling AI, ya no depende de generación por IA — reescalado a
480px (va con `blur-2xl`, la resolución no importa) e ida-vuelta
(`reverse`+`concat`) para loop sin salto. Solo MP4: para este contenido tan
difuminado el WebM salía más pesado, mismo motivo que el hero. Cae a la
imagen/gradiente estático con `prefers-reduced-motion`.

## Recorte de la villa en CinematicReveal: `public/frames/hero-cutout/`

42 WebP con transparencia (`f000.webp`…`f041.webp`, 1280px de ancho) que
`CinematicReveal` precarga y dibuja en un `<canvas>` según el progreso de
scroll.

**Procedencia:** ya no es metraje de Kling AI — es un vídeo real de stock,
["An Exterior Design of a Modern House"](https://www.pexels.com) (Pexels,
licencia libre para uso comercial), del que se extrajeron los primeros
~6.9s (165 frames a 24fps, reducidos a 42 tomando uno de cada cuatro) y se
les quitó el fondo con `rembg` (`isnet-general-use`) cuadro a cuadro —
mismo proceso que antes, aplicado a un clip real en vez de generado por IA.

**Por qué solo ~6.9s del clip de 20s:** mismo patrón que la primera versión
— el recorte funciona muy bien mientras hay cielo/fondo simple que quitar
(la cámara se acerca caminando hacia la casa con cielo despejado detrás),
pero se degrada cuando la cámara pasa bajo el porche techado y el fondo se
vuelve complejo (sombra, columnas, interior visible a través del vidrio).
Se verificó frame a frame antes de elegir el corte (frame 165 limpio,
frame 170 ya se empieza a desvanecer).

**Licencia:** licencia Pexels — libre para uso comercial, sin atribución
obligatoria. Sin restricciones de tier gratuito como tenía Kling.

**Para regenerar con un vídeo nuevo:** repite el proceso (extraer frames →
`rembg` cuadro a cuadro → recortar donde el fondo deje de ser segmentable →
reemplazar los WebP en `public/frames/hero-cutout/`). El componente no
necesita cambios si el número de frames es distinto — ajusta `FRAME_COUNT`
al inicio de `CinematicReveal.tsx`.

## Loop de fondo: `public/videos/card-loop-lumiere.mp4`/`.webm`

Vídeo real (no frames sueltos) de una cortina de lino moviéndose con la
brisa junto a una ventana — ["Wind Blowing The
Curtain"](https://www.pexels.com) (Pexels, licencia libre), no Kling AI.
Recortado a la franja donde la tela llena la mayor parte del cuadro,
reescalado a 960px de ancho, ida-vuelta (`reverse`+`concat`) para loop sin
salto — el navegador decodifica el resto. MP4 10MB / WebM 4.7MB (acá el
WebM sí gana, a diferencia del hero: menos resolución y movimiento).

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
