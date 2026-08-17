"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";
import RevealText from "@/components/RevealText";

const PARTICLE_COUNT = 18;

export default function CutoutParallaxReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const skyRawRef = useRef<HTMLDivElement>(null);
  const skyDevRef = useRef<HTMLDivElement>(null);
  const terrainRawRef = useRef<SVGPathElement>(null);
  const terrainDevRef = useRef<SVGPathElement>(null);
  const buildingRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (
      !skyRawRef.current ||
      !skyDevRef.current ||
      !terrainRawRef.current ||
      !terrainDevRef.current ||
      !buildingRef.current
    )
      return;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(buildingRef.current, { y: 0, opacity: 1, scale: 1 });
        gsap.set(skyDevRef.current, { opacity: 1 });
        gsap.set(terrainDevRef.current, { opacity: 1 });
        return;
      }

      gsap.set(buildingRef.current, { y: "40%", opacity: 0, scale: 0.92 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=160%",
          scrub: 0.6,
          pin: true,
        },
      });

      tl.to(skyDevRef.current, { opacity: 1, ease: "none" }, 0.15)
        .to(terrainDevRef.current, { opacity: 1, ease: "none" }, 0.2)
        .to(
          buildingRef.current,
          { y: "0%", opacity: 1, scale: 1, ease: "power2.out" },
          0.3
        )
        .to(buildingRef.current, { y: "-6%", ease: "none" }, 0.65)
        .to(skyRawRef.current, { yPercent: -15, ease: "none" }, 0)
        .to(particlesRef.current, { yPercent: -35, ease: "none" }, 0);
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative h-svh overflow-hidden bg-[var(--foreground)]"
    >
      <div ref={skyRawRef} className="absolute inset-0 bg-gradient-to-b from-[#2b3a2a] via-[#1c2419] to-[var(--foreground)]" />
      <div
        ref={skyDevRef}
        className="absolute inset-0 opacity-0 bg-gradient-to-b from-[#3a2f1c] via-[#221b10] to-[var(--foreground)]"
      />

      <div ref={particlesRef} className="pointer-events-none absolute inset-0">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-[var(--accent)]/40"
            style={{
              left: p.left,
              bottom: "-5%",
              width: p.size,
              height: p.size,
              animation: `siteryo-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <svg
        className="absolute inset-x-0 bottom-0 h-[35%] w-full"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
      >
        <path
          ref={terrainRawRef}
          d="M0,90 C160,40 320,140 480,100 C650,58 780,150 960,110 C1140,70 1300,150 1440,95 L1440,220 L0,220 Z"
          fill="#4a3c26"
        />
      </svg>
      <svg
        className="absolute inset-x-0 bottom-0 h-[35%] w-full"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
      >
        <path
          ref={terrainDevRef}
          className="opacity-0"
          d="M0,140 L280,140 L320,120 L1120,120 L1160,140 L1440,140 L1440,220 L0,220 Z"
          fill="var(--accent)"
          fillOpacity={0.18}
        />
      </svg>

      <div
        ref={buildingRef}
        className="absolute inset-x-0 bottom-[8%] flex justify-center px-6"
      >
        <Image
          src="/cutouts/casa-arena-cutout.png"
          alt="Casa Arena, recorte arquitectónico"
          width={1400}
          height={1405}
          priority={false}
          className="h-auto w-full max-w-3xl drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-16 px-6 sm:px-10">
        <RevealText
          as="h2"
          lines={["De terreno crudo", "a arquitectura habitable."]}
          className="max-w-lg font-serif text-2xl leading-tight text-white sm:text-4xl"
        />
      </div>

      <style jsx>{`
        @keyframes siteryo-float {
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
    </section>
  );
}
