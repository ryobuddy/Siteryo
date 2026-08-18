"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import FadeInView from "@/components/FadeInView";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Slow vertical drift for the glass panels once revealed — keeps them from
// reading as static blocks once the scroll-triggered reveal settles.
const idleFloat = {
  animate: { y: [0, -8, 0] },
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
};

const FRAME_COUNT = 38;
const FRAME_SRC = (i: number) => `/frames/hero-cutout/f${String(i).padStart(3, "0")}.png`;
const PARTICLE_COUNT = 16;

const label = "font-sans text-[11px] uppercase tracking-[0.15em]";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// The villa cutout floats over its own custom background instead of
// filling the frame — "cover" fit made it balloon to viewport size and
// collide with the text overlay, since the source footage dollies in
// closer with every frame. "Contain" + a fixed scale-down keeps it a
// grounded, discrete object with breathing room around the copy, and
// bottom-anchoring reads as the villa sitting on the gradient "ground"
// instead of floating dead-center through the headline.
const VILLA_SCALE = 0.5;
const VILLA_VERTICAL_ANCHOR = 0.56;

function drawImageContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, alpha: number) {
  const canvas = ctx.canvas;
  const ratio = Math.min(canvas.width / img.width, canvas.height / img.height) * VILLA_SCALE;
  const w = img.width * ratio;
  const h = img.height * ratio;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) * VILLA_VERTICAL_ANCHOR;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, x, y, w, h);
  ctx.globalAlpha = 1;
}

// Cross-dissolves between the two nearest frames instead of hard-cutting on
// the rounded index — the frame sequence only has 38 source images, so a
// hard cut between them reads as a flicker as the scroll speeds up.
function drawBlendedFrame(ctx: CanvasRenderingContext2D, images: HTMLImageElement[], position: number) {
  const canvas = ctx.canvas;
  const lastIndex = images.length - 1;
  const clamped = clamp(position, 0, lastIndex);
  const i0 = Math.floor(clamped);
  const i1 = Math.min(i0 + 1, lastIndex);
  const frac = clamped - i0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const imgA = images[i0];
  const imgB = images[i1];
  if (imgA?.complete) drawImageContain(ctx, imgA, 1);
  if (i1 !== i0 && imgB?.complete && frac > 0) drawImageContain(ctx, imgB, frac);
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" className={className} aria-hidden>
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-[var(--accent)] bg-white/15 px-3 py-1.5 backdrop-blur-md">
      <span className={`${label} text-white`}>{children}</span>
    </div>
  );
}

const capabilities = [
  {
    title: "Curaduría en tiempo real",
    body: "Solo llega a ti lo que encaja.",
  },
  {
    title: "Mirada en capas",
    body: "De la foto a la visita, sin perder el hilo.",
  },
  {
    title: "Ritmo adaptado",
    body: "A tu calendario, sin presión.",
  },
];

export default function CinematicReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const progressRef = useRef(0);
  const smoothedRef = useRef(0);

  const [framesReady, setFramesReady] = useState(false);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: `${(i * 137.5) % 100}%`,
        size: 2 + ((i * 7) % 5),
        delay: (i % 6) * 0.4,
        duration: 6 + (i % 5),
      })),
    []
  );

  // Preload the cutout frame sequence (real dron footage, background removed).
  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = [];
    let loaded = 0;
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new window.Image();
      img.src = FRAME_SRC(i);
      img.onload = () => {
        loaded++;
        if (loaded === FRAME_COUNT && !cancelled) setFramesReady(true);
      };
      images.push(img);
    }
    imagesRef.current = images;
    return () => {
      cancelled = true;
    };
  }, []);

  // Pin the background layer for the container's whole scroll range and
  // release it cleanly at the end (ScrollTrigger pin on an absolute layer —
  // more reliable than position:sticky + negative margin, see README).
  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current || !bgRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: bgRef.current,
        pinSpacing: false,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let rafId = 0;

    function tick() {
      smoothedRef.current += (progressRef.current - smoothedRef.current) * 0.12;
      const p = smoothedRef.current;

      const images = imagesRef.current;
      const canvas = canvasRef.current;
      if (images.length > 0 && canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const targetW = canvas.clientWidth * dpr;
          const targetH = canvas.clientHeight * dpr;
          if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
          }
          // Hold on the last frame past the footage's own progress range —
          // the villa settles while Section Two's content scrolls over it.
          // Blend between the two nearest frames instead of snapping to the
          // rounded one, since 38 source frames is coarse enough to flicker
          // on a hard cut once the scroll speeds up.
          const position = p * 2.2 * (images.length - 1);
          drawBlendedFrame(ctx, images, position);
        }
      }

      if (gradientRef.current) {
        gradientRef.current.style.opacity = String(clamp(p * 1.6, 0, 1));
      }

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [prefersReducedMotion]);

  return (
    <div ref={containerRef} className="relative bg-[#0a0a0a]">
      <div ref={bgRef} className="absolute inset-0 h-svh w-full overflow-hidden pointer-events-none">
        {!prefersReducedMotion && (
          <video
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-80 blur-2xl saturate-150"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          >
            <source src="/videos/ambient-loop.webm" type="video/webm" />
            <source src="/videos/ambient-loop.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c2419]/55 via-[#141712]/65 to-[#0a0a0a]/90" />
        <div
          ref={gradientRef}
          className="absolute inset-0 bg-gradient-to-b from-[#2a2013]/55 via-[#181410]/65 to-[#0a0a0a]/90 opacity-0"
        />

        <div className="absolute inset-0">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute rounded-full bg-[var(--accent)]/40"
              style={{
                left: particle.left,
                bottom: "-5%",
                width: particle.size,
                height: particle.size,
                animation: `cinematic-float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
              }}
            />
          ))}
        </div>

        {prefersReducedMotion ? (
          <Image
            src="/hero.jpg"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
              framesReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </div>

      <div className="relative z-10 px-5 sm:px-8 md:px-12">
        {/* Section One */}
        <section className="flex min-h-svh flex-col justify-between pt-24 pb-12 sm:pt-28 md:pb-16">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <FadeInView delay={150} className="flex flex-col gap-2">
              {["ARQUITECTURA DE AUTOR", "CURADURÍA DE PROPIEDADES", "ASESORÍA PATRIMONIAL"].map((item) => (
                <span key={item} className={`${label} text-white/90 drop-shadow-md`}>
                  / {item}
                </span>
              ))}
            </FadeInView>
            <FadeInView delay={300} className="max-w-xs sm:text-right">
              <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
                Diseño, luz y ubicación. Sin concesiones.
              </p>
            </FadeInView>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <FadeInView delay={150} className="mb-5 inline-block">
                <Badge>128 Propiedades Entregadas</Badge>
              </FadeInView>
              <FadeInView delay={280}>
                <h1 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-[0_12px_36px_rgba(0,0,0,0.85)] sm:text-6xl lg:text-7xl">
                  Luz. Espacio.
                  <br />
                  Legado.
                </h1>
              </FadeInView>
            </div>

            <FadeInView delay={420}>
              <motion.div
                animate={idleFloat.animate}
                transition={idleFloat.transition}
                className="flex items-center gap-4 rounded-xl bg-white/15 p-3 backdrop-blur-md"
              >
                <Image
                  src="/properties/arena.jpg"
                  alt="Casa Arena, Sotogrande"
                  width={80}
                  height={96}
                  className="h-24 w-20 rounded-lg object-cover"
                />
                <div className="flex flex-col gap-1.5 pr-2">
                  <p className="text-sm font-medium text-white">Agenda tu visita</p>
                  <p className={`${label} text-white/60`}>Próxima disponible esta semana</p>
                  <a
                    href="#contacto"
                    className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-colors hover:bg-white/85"
                  >
                    Reservar visita
                    <ChevronRight />
                  </a>
                </div>
              </motion.div>
            </FadeInView>
          </div>
        </section>

        <div className="h-[80vh]" aria-hidden />

        {/* Section Two */}
        <section id="proceso" className="flex min-h-svh flex-col justify-between pb-12 md:pb-16">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <FadeInView delay={120}>
              <Badge>Proceso a medida</Badge>
            </FadeInView>
            <FadeInView delay={220} className="max-w-sm sm:text-right">
              <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
                Interpretamos lo que buscas. Mostramos lo que importa.
              </p>
            </FadeInView>
          </div>

          <div className="flex flex-1 flex-col justify-end gap-12 md:flex-row md:items-end md:justify-between md:gap-16">
            <div className="max-w-xl">
              <FadeInView delay={180}>
                <h2 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-[0_12px_36px_rgba(0,0,0,0.85)] sm:text-6xl lg:text-7xl">
                  Cada detalle,
                  <br />a la vista.
                </h2>
              </FadeInView>
              <FadeInView delay={320}>
                <p className="mt-6 max-w-md text-sm text-white/80 drop-shadow-md sm:text-base">
                  De la visita a la firma, sin prisas ni ruido.
                </p>
              </FadeInView>
              <FadeInView delay={420}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#propiedades"
                    className="inline-flex items-center gap-1 rounded-full bg-white px-5 py-2.5 text-xs font-medium text-black transition-colors hover:bg-white/85 sm:text-sm"
                  >
                    Ver propiedades
                    <ChevronRight />
                  </a>
                  <a
                    href="#contacto"
                    className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:text-sm"
                  >
                    Agendar visita
                  </a>
                </div>
              </FadeInView>
            </div>

            <FadeInView delay={260} className="w-full max-w-md">
              <motion.div
                animate={idleFloat.animate}
                transition={{ ...idleFloat.transition, duration: 7 }}
                className="rounded-2xl border border-white/15 bg-white/10 px-5 backdrop-blur-md sm:px-6"
              >
                {capabilities.map((item, i) => (
                  <FadeInView
                    key={item.title}
                    delay={300 + i * 110}
                    className={`group flex gap-5 py-5 ${i < capabilities.length - 1 ? "border-b border-white/15" : ""}`}
                  >
                    <span className={`${label} text-white/55`}>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="flex items-center gap-1.5 text-base font-medium text-white sm:text-lg">
                        {item.title}
                        <ChevronRight className="text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/70">{item.body}</p>
                    </div>
                  </FadeInView>
                ))}
              </motion.div>
            </FadeInView>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes cinematic-float {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateY(-110vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
