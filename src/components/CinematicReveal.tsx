"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import FadeInView from "@/components/FadeInView";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const VIDEO_SRC = "/video/hero-scrub.mp4";
const POSTER_SRC = "/hero.jpg";
const MIN_FRAMES = 24;
const MAX_FRAMES = 90;
const FRAME_TARGET_WIDTH = 960;

const label = "font-sans text-[11px] uppercase tracking-[0.15em]";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function drawCover(ctx: CanvasRenderingContext2D, source: CanvasImageSource, sw: number, sh: number) {
  const canvas = ctx.canvas;
  const ratio = Math.max(canvas.width / sw, canvas.height / sh);
  const w = sw * ratio;
  const h = sh * ratio;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
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
    body: "Filtramos cada propiedad antes de mostrártela, para que solo veas lo que encaja.",
  },
  {
    title: "Mirada en capas",
    body: "De la primera foto a la visita en persona, sin perder el hilo de lo que buscas.",
  },
  {
    title: "Ritmo adaptado",
    body: "Ajustamos el proceso a tu calendario, sin prisas ni presión.",
  },
];

export default function CinematicReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  const progressRef = useRef(0);
  const smoothedRef = useRef(0);

  const [videoHasFrame, setVideoHasFrame] = useState(false);
  const [framesReady, setFramesReady] = useState(false);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Pin the background layer for the container's whole scroll range and
  // release it cleanly at the end — same mechanism as the site's other
  // pinned sections (GSAP handles the edge cases that a hand-rolled
  // position:sticky + negative-margin overlap gets wrong).
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

  // Build an offscreen frame cache for smooth scrubbing (falls back to direct
  // video seeking below while it's not ready, or if the source never loads).
  useEffect(() => {
    if (prefersReducedMotion) return;
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;

    const onLoadedData = () => setVideoHasFrame(true);
    video.addEventListener("loadeddata", onLoadedData);

    async function buildCache() {
      await new Promise((resolve) => {
        if (video!.readyState >= 2) return resolve(undefined);
        video!.addEventListener("loadeddata", () => resolve(undefined), { once: true });
        video!.addEventListener("error", () => resolve(undefined), { once: true });
      });
      await new Promise((r) => setTimeout(r, 300));
      if (cancelled) return;

      const off = document.createElement("video");
      off.src = VIDEO_SRC;
      off.muted = true;
      off.playsInline = true;
      off.preload = "auto";

      const loaded = await new Promise<boolean>((resolve) => {
        off.addEventListener("loadedmetadata", () => resolve(true), { once: true });
        off.addEventListener("error", () => resolve(false), { once: true });
      });
      if (cancelled || !loaded || !off.duration || !isFinite(off.duration)) return;

      const frameCount = Math.min(MAX_FRAMES, Math.max(MIN_FRAMES, Math.round(off.duration * 12)));
      const scale = FRAME_TARGET_WIDTH / off.videoWidth;
      const w = FRAME_TARGET_WIDTH;
      const h = Math.round(off.videoHeight * scale);
      const work = document.createElement("canvas");
      work.width = w;
      work.height = h;
      const ctx = work.getContext("2d");
      if (!ctx) return;

      const frames: ImageBitmap[] = [];
      for (let i = 0; i < frameCount; i++) {
        if (cancelled) break;
        const t = (i / (frameCount - 1)) * Math.max(0, off.duration - 0.05);
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            off.removeEventListener("seeked", onSeeked);
            resolve();
          };
          off.addEventListener("seeked", onSeeked);
          off.currentTime = t;
        });
        ctx.drawImage(off, 0, 0, w, h);
        try {
          frames.push(await createImageBitmap(work));
        } catch {
          break;
        }
      }
      if (!cancelled && frames.length > 0) {
        framesRef.current = frames;
        setFramesReady(true);
      }
    }

    buildCache();
    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", onLoadedData);
      framesRef.current.forEach((f) => f.close());
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let rafId = 0;

    function tick() {
      smoothedRef.current += (progressRef.current - smoothedRef.current) * 0.12;
      const p = smoothedRef.current;
      const frames = framesRef.current;
      const canvas = canvasRef.current;

      if (frames.length > 0 && canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const targetW = canvas.clientWidth * dpr;
          const targetH = canvas.clientHeight * dpr;
          if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
          }
          const idx = clamp(Math.round(p * (frames.length - 1)), 0, frames.length - 1);
          const frame = frames[idx];
          drawCover(ctx, frame, frame.width, frame.height);
        }
      } else {
        const video = videoRef.current;
        if (video && video.duration && isFinite(video.duration)) {
          const target = p * Math.max(0, video.duration - 0.05);
          if (Math.abs(video.currentTime - target) > 0.04) video.currentTime = target;
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [prefersReducedMotion]);

  const showCanvas = framesReady && !prefersReducedMotion;
  const showVideo = videoHasFrame && !framesReady && !prefersReducedMotion;
  const showPoster = !showCanvas && (!showVideo || prefersReducedMotion);

  return (
    <div ref={containerRef} className="relative bg-[#0a0a0a]">
      <div ref={bgRef} className="absolute inset-0 h-svh w-full overflow-hidden pointer-events-none">
        <Image
          src={POSTER_SRC}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className={`object-cover transition-opacity duration-500 ${showPoster ? "opacity-100" : "opacity-0"}`}
        />
        {!prefersReducedMotion && (
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            muted
            playsInline
            preload="auto"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              showVideo ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        {!prefersReducedMotion && (
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
              showCanvas ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/50" />
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
                Seleccionamos residencias donde el diseño, la luz y la ubicación
                justifican cada metro cuadrado.
              </p>
            </FadeInView>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <FadeInView delay={150} className="mb-5 inline-block">
                <Badge>128 Propiedades Entregadas</Badge>
              </FadeInView>
              <FadeInView delay={280}>
                <h1 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
                  Luz. Espacio.
                  <br />
                  Legado.
                </h1>
              </FadeInView>
            </div>

            <FadeInView delay={420}>
              <div className="flex items-center gap-4 rounded-xl bg-white/15 p-3 backdrop-blur-md">
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
              </div>
            </FadeInView>
          </div>
        </section>

        <div className="h-[80vh]" aria-hidden />

        {/* Section Two */}
        <section className="flex min-h-svh flex-col justify-between pb-12 md:pb-16">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <FadeInView delay={120}>
              <Badge>Proceso a medida</Badge>
            </FadeInView>
            <FadeInView delay={220} className="max-w-sm sm:text-right">
              <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
                No solo mostramos propiedades — interpretamos lo que buscas y
                seleccionamos lo que de verdad importa.
              </p>
            </FadeInView>
          </div>

          <div className="flex flex-1 flex-col justify-end gap-12 md:flex-row md:items-end md:justify-between md:gap-16">
            <div className="max-w-xl">
              <FadeInView delay={180}>
                <h2 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
                  Cada detalle,
                  <br />a la vista.
                </h2>
              </FadeInView>
              <FadeInView delay={320}>
                <p className="mt-6 max-w-md text-sm text-white/80 drop-shadow-md sm:text-base">
                  Desde la primera visita hasta la firma, Siteryo convierte cada
                  búsqueda en una decisión clara — con calma, con precisión, a tu
                  ritmo.
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
              <div className="rounded-2xl border border-white/15 bg-white/10 px-5 backdrop-blur-md sm:px-6">
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
              </div>
            </FadeInView>
          </div>
        </section>
      </div>
    </div>
  );
}
