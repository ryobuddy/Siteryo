"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { lenisRef } from "@/lib/lenis";
import { useMediaQuery } from "@/lib/useMediaQuery";

type Step = {
  selector: string;
  title: string;
  body: string;
};

const steps: Step[] = [
  {
    selector: "#inicio h1",
    title: "Bienvenido a Siteryo",
    body: "Un recorrido corto por el sitio: cada sección combina scroll y vídeo real para presentar cada propiedad.",
  },
  {
    selector: "#proceso h2",
    title: "El proceso, en contexto",
    body: "El recorte de la villa y la capa de luz de fondo vienen del mismo metraje real — nada de renders genéricos.",
  },
  {
    selector: "#propiedades [data-card]",
    title: "Propiedades seleccionadas",
    body: "Cada card lleva a una ficha propia. Ático Lumière tiene, además, un loop de vídeo en vez de una foto fija.",
  },
  {
    selector: "#contacto h2",
    title: "Hablemos de tu propiedad",
    body: "Aquí termina el recorrido — el formulario está siempre a un scroll de distancia.",
  },
];

export default function GuidedTour() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const goToStep = useCallback((index: number) => {
    const step = steps[index];
    const el = document.querySelector<HTMLElement>(step.selector);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -window.innerHeight * 0.38, duration: 1 });
    } else {
      el.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }, []);

  // Keep the spotlight glued to the target while the tour is open —
  // Lenis's scroll animation means the element keeps moving for ~1s after
  // each step change, so this tracks it every frame rather than once.
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    function track() {
      const step = steps[stepIndex];
      const el = document.querySelector<HTMLElement>(step.selector);
      setRect(el ? el.getBoundingClientRect() : null);
      raf = requestAnimationFrame(track);
    }
    raf = requestAnimationFrame(track);
    return () => cancelAnimationFrame(raf);
  }, [open, stepIndex]);

  useEffect(() => {
    if (open) goToStep(stepIndex);
  }, [open, stepIndex, goToStep]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setStepIndex((i) => Math.min(i + 1, steps.length - 1));
      if (e.key === "ArrowLeft") setStepIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function start() {
    setStepIndex(0);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setRect(null);
    triggerRef.current?.focus();
  }

  function next() {
    if (stepIndex + 1 < steps.length) {
      setStepIndex(stepIndex + 1);
    } else {
      close();
    }
  }

  function prev() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  // The tour's steps target sections that only exist on the homepage.
  if (pathname !== "/") return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={start}
        className="fixed bottom-6 right-6 z-40 rounded-full border border-[var(--foreground)]/15 bg-[var(--background)]/90 px-4 py-2.5 text-xs tracking-wide text-[var(--foreground)] shadow-lg backdrop-blur-md transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        ✦ Tour guiado
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              aria-hidden
              className="fixed inset-0 z-[90]"
              onClick={close}
            />
            {rect && (
              <motion.div
                aria-hidden
                className="pointer-events-none fixed z-[91] rounded-xl border-2 border-[var(--accent)]"
                animate={{
                  top: rect.top - 8,
                  left: rect.left - 8,
                  width: rect.width + 16,
                  height: rect.height + 16,
                }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ boxShadow: "0 0 0 9999px rgba(10,9,7,0.78)" }}
              />
            )}

            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="tour-title"
              tabIndex={-1}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 bottom-6 z-[92] mx-auto max-w-md rounded-2xl border border-white/10 bg-[#16140f]/95 p-6 text-white shadow-2xl backdrop-blur-md outline-none sm:inset-x-auto sm:right-6"
            >
              <p aria-live="polite" className="mb-2 text-[11px] uppercase tracking-[0.15em] text-white/50">
                Paso {stepIndex + 1} de {steps.length}
              </p>
              <h2 id="tour-title" className="font-serif text-xl">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{step.body}</p>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {steps.map((s, i) => (
                    <span
                      key={s.selector}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        i === stepIndex ? "bg-[var(--accent)]" : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="px-3 py-2 text-xs text-white/60 transition-colors hover:text-white"
                  >
                    Cerrar
                  </button>
                  {stepIndex > 0 && (
                    <button
                      type="button"
                      onClick={prev}
                      className="rounded-full border border-white/20 px-4 py-2 text-xs transition-colors hover:border-white/40"
                    >
                      Atrás
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={next}
                    className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-medium text-[#16140f] transition-colors hover:bg-white"
                  >
                    {isLast ? "Terminar" : "Siguiente"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
