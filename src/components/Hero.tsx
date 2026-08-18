"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";
import WebGLScrollHero from "@/components/WebGLScrollHero";

const headline = ["Arquitectura", "que se habita", "antes de vivirla."];
const HERO_FRAME_COUNT = 41;

export default function Hero() {
  const imageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const frameSrc = useCallback(
    (i: number) => `/frames/hero-scrub/f${String(i).padStart(3, "0")}.webp`,
    []
  );

  useEffect(() => {
    if (!imageRef.current || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { scale: 1.18, opacity: 0, clipPath: "inset(0% 100% 0% 0%)" },
        {
          scale: 1.05,
          opacity: 0.8,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.8,
          delay: 0.2,
          ease: "power3.inOut",
        }
      );
      gsap.to(imageRef.current, {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="inicio"
      ref={sectionRef}
      className="relative flex h-svh items-end overflow-hidden bg-[var(--foreground)]"
    >
      <div
        ref={imageRef}
        className="absolute inset-0 -top-[10%] h-[120%] w-full scale-105 opacity-80"
      >
        {prefersReducedMotion ? (
          <div className="h-full w-full bg-[url('/hero.jpg')] bg-cover bg-center" />
        ) : (
          <WebGLScrollHero
            frameCount={HERO_FRAME_COUNT}
            frameSrc={frameSrc}
            poster="/hero.jpg"
            sectionRef={sectionRef}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)] via-[var(--foreground)]/10 to-[var(--foreground)]/30" />

      <div className="relative z-10 w-full px-5 pb-20 sm:px-8 sm:pb-28 lg:px-6">
        <h1 className="font-serif text-5xl leading-[0.98] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-[7rem] xl:text-[8.5rem]">
          {headline.map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 1,
                  delay: 0.15 * i + 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="block"
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-md text-sm tracking-wide text-white/70 sm:text-base"
        >
          Seleccionamos y presentamos propiedades de autor donde el diseño,
          la luz y el espacio son parte de la inversión.
        </motion.p>
      </div>
    </section>
  );
}
