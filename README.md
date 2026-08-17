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
- `src/components/CutoutParallaxReveal.tsx` — sección pineada con recorte
  (PNG sin fondo, fondo eliminado con un modelo de segmentación) de Casa
  Arena que "se construye" en escena — sube, aparece y se asienta — mientras
  el terreno (dos `<path>` SVG: uno silvestre, otro pavimentado) y el cielo
  cruzan de tono y unas partículas ambientales derivan a su propia velocidad.
  Cada capa se mueve a un ritmo distinto de scroll (GSAP ScrollTrigger
  `scrub` + `pin`), el mismo patrón de "cutout + fondo animado en paralelo"
  habitual en scrollytelling corto (TikTok/Reels) y en sitios de Awwwards.
  Fallback estático para `prefers-reduced-motion`.
- `src/components/RevealText.tsx` — reveal de titulares línea a línea con
  máscara `overflow-hidden`, reutilizado en Hero, Propiedades y Contacto
- `src/components/DistortImage.tsx` — distorsión líquida por shader WebGL2
  (sin dependencias — WebGL nativo) sobre la imagen de cada
  `PropertyCard` al pasar el cursor: desplazamiento radial + ripple
  centrado en el puntero, con `cover` fit calculado en el propio shader.
  Solo se activa con `(hover: hover) and (pointer: fine)` y
  `!prefers-reduced-motion`; cae a `next/image` normal en el resto de casos.
- `src/components/VideoScrubReveal.tsx` — listo para recibir un vídeo real
  (ver §Vídeo más abajo): ata `video.currentTime` al progreso de scroll vía
  GSAP ScrollTrigger (`scrub` + `pin`), con imagen de póster como fallback
  mientras el vídeo carga o si hay `prefers-reduced-motion`. Aún no está
  montado en `src/app/page.tsx` — falta el archivo de vídeo.
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

`VideoScrubReveal` ya está construido y probado, solo falta el archivo.
Cuando llegue el vídeo generado:

1. Colócalo en `public/video/hero-scrub.mp4` (specs y prompts en el
   [Motion Playbook](https://claude.ai/code/artifact/4ff833a2-2161-47fe-8e71-85df54fa11ed))
2. Genera un póster estático (un frame representativo) en
   `public/video/hero-scrub-poster.jpg`
3. Móntalo en `src/app/page.tsx`:
   `<VideoScrubReveal src="/video/hero-scrub.mp4" poster="/video/hero-scrub-poster.jpg" />`
