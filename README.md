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
- `src/components/Hero.tsx` — hero a pantalla completa con parallax
- `src/components/CinematicReveal.tsx` — sección de dos escenas con el
  recorte (fondo transparente) de un vídeo real de la villa flotando sobre
  un fondo propio (gradiente + partículas ambientales), fijada con GSAP
  ScrollTrigger (`pin` sobre un layer `absolute`, no `position: sticky` —
  ver nota abajo) mientras el contenido (badges de cristal, titular, tarjeta
  de contacto, panel de "proceso") se desplaza por encima. Adaptado de un
  prompt de recreación de landing de IA (stack React/Tailwind) al contexto
  de Siteryo: mismo sistema de "glass" y reveals, copy y capas de contenido
  reescritos para arquitectura residencial.
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
- `src/components/LoopBackground.tsx` — loop de fondo tipo cinemagraph: secuencia
  de frames (`<canvas>`, ida-vuelta/ping-pong para que cierre sin salto) en vez
  de la foto estática de una card. Pausa el `requestAnimationFrame` fuera de
  viewport (`IntersectionObserver`) y cae a una imagen fija con
  `prefers-reduced-motion`. Usado en la card de "Ático Lumière" con
  `public/frames/card-loop/` (cortina de lino moviéndose, generada con Kling
  AI). Cada `Property` puede activar esta card-loop declarando
  `loopBackground: { frameCount, prefix }` en `src/lib/properties.ts`.
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

## Vídeo del Hero: `public/frames/hero-cutout/`

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

## Loop de fondo: `public/frames/card-loop/`

80 WebP (`f000.webp`…`f079.webp`, 900px de ancho) de una cortina de lino
moviéndose con suavidad, generados también con Kling AI (5s, 1920×1080).
A diferencia del hero, aquí **no hace falta quitar el fondo** — el clip entero
es el fondo de la card, así que el proceso fue más simple: extraer frames,
recortar la franja inferior (llevaba la marca de agua de Kling), reducir a 1
de cada 3 frames y armar una secuencia ida-vuelta (ping-pong) para que el
loop cierre sin salto, sin necesitar crossfade. Mismo aviso de licencia que
el vídeo del hero: revisa los términos de la cuenta de Kling antes de
producción.
