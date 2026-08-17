"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "@/lib/gsap";

const headline = ["Arquitectura", "que se habita", "antes de vivirla."];

export default function Hero() {
  const imageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

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
      ref={sectionRef}
      className="relative flex h-svh items-end overflow-hidden bg-[var(--foreground)]"
    >
      <div
        ref={imageRef}
        className="absolute inset-0 -top-[10%] h-[120%] w-full scale-105 bg-[url('/hero.jpg')] bg-cover bg-center opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)] via-[var(--foreground)]/10 to-[var(--foreground)]/30" />

      <div className="relative z-10 w-full px-6 pb-20 sm:px-10 sm:pb-28">
        <h1 className="font-serif text-4xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">
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
