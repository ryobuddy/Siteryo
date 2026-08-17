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
- `src/components/CinematicReveal.tsx` — sección de dos escenas con fondo de
  vídeo scrubbed por scroll (poster → video → canvas con caché de frames
  offscreen, con lerp de suavizado y fallback a seek directo), fijada con
  GSAP ScrollTrigger (`pin` sobre un layer `absolute`, no `position: sticky`
  — ver nota abajo) mientras el contenido (badges de cristal, titular,
  tarjeta de contacto, panel de "proceso") se desplaza por encima. Adaptado
  de un prompt de recreación de landing de IA (stack React/Tailwind) al
  contexto de Siteryo: mismo sistema de "glass" y reveals, copy y capas de
  contenido reescritos para arquitectura residencial. Vídeo aún pendiente
  (ver §Vídeo) — hasta entonces cae a `public/hero.jpg` como fondo estático.
  **Nota de implementación:** la primera versión usaba `position: sticky` +
  margen negativo para superponer el fondo al contenido; ese patrón resultó
  frágil (el navegador calculaba mal el punto de "despegue" del sticky,
  dejando el fondo visible sobre las secciones siguientes). Se sustituyó por
  `ScrollTrigger({ pin, pinSpacing: false })` sobre un layer `absolute`,
  igual que el resto de secciones pineadas del sitio.
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

## Vídeo (pendiente)

`CinematicReveal` ya está construido y probado (cae a `public/hero.jpg`
mientras tanto), solo falta el archivo. Cuando llegue el vídeo generado:

1. Colócalo en `public/video/hero-scrub.mp4` (specs y prompts en el
   [Motion Playbook](https://claude.ai/code/artifact/4ff833a2-2161-47fe-8e71-85df54fa11ed))
2. `CinematicReveal` lo recoge automáticamente desde esa ruta — no hace
   falta tocar `page.tsx`. Si el póster definitivo no debe ser
   `public/hero.jpg`, cambia `POSTER_SRC` al inicio del componente.
