import type Lenis from "lenis";

// Set by SmoothScroll so other components (e.g. GuidedTour) can trigger a
// programmatic scroll that stays in sync with Lenis's own rAF loop —
// native `window.scrollTo({ behavior: "smooth" })` is forced to "auto"
// while Lenis is active (see globals.css), so it won't animate.
export const lenisRef: { current: Lenis | null } = { current: null };
