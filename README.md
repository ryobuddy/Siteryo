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
- `src/components/FrameSequenceReveal.tsx` — sección pineada que revela una
  secuencia real de 60 frames de vídeo en un `<canvas>`, con el avance
  controlado por scroll vía GSAP ScrollTrigger (`scrub` + `pin`). Es la misma
  técnica que usan sitios como [Magma](https://thisismagma.com) — estudiada
  a partir de un clon en GitHub — adaptada aquí a React/Next con fallback
  estático para `prefers-reduced-motion`.
- `src/components/RevealText.tsx` — reveal de titulares línea a línea con
  máscara `overflow-hidden`, reutilizado en Hero, Propiedades y Contacto
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

Los frames en `public/frames/` (`f000.jpg`…`f059.jpg`) se extrajeron de un
vídeo de dron real con licencia libre: *Drone video of Keila waterfall and
manor in Keila-Joa, Estonia*, © Sillerkiil, [CC BY-SA
4.0](https://creativecommons.org/licenses/by-sa/4.0/), vía Wikimedia
Commons. El crédito se muestra en la propia sección del sitio (requisito de
la licencia BY-SA); no se presenta como una de las propiedades en venta.
