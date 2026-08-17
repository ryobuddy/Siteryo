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
- `src/components/Properties.tsx` / `PropertyCard.tsx` — grid de propiedades con reveal por scroll y cursor de hover
- `src/components/Stats.tsx` — contadores animados al entrar en viewport
- `src/components/Contact.tsx` — formulario de contacto + footer
- `src/lib/gsap.ts` — registro centralizado del plugin ScrollTrigger
- `src/lib/useMediaQuery.ts` — hook de media query vía `useSyncExternalStore`
- `src/lib/properties.ts` — datos de las propiedades mostradas

Las imágenes en `public/properties/`, `public/hero.jpg` y `public/grain.jpg`
son fotografía sintética generada (gradientes de luz, profundidad de campo y
grano, sin depender de bancos de imágenes externos) — reemplázalas por
fotografía real de las propiedades cuando esté disponible.
