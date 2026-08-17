"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";

export default function Preloader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (prefersReducedMotion || !overlayRef.current) return;

    document.documentElement.classList.add("preloading");
    const counter = { value: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove("preloading");
        setDone(true);
      },
    });

    tl.to(counter, {
      value: 100,
      duration: 1.1,
      ease: "power2.inOut",
      onUpdate: () => {
        if (countRef.current) {
          countRef.current.textContent = String(Math.round(counter.value));
        }
      },
    }).to(overlayRef.current, {
      yPercent: -100,
      duration: 0.7,
      ease: "power4.inOut",
    });

    return () => {
      tl.kill();
      document.documentElement.classList.remove("preloading");
    };
  }, [prefersReducedMotion]);

  if (done || prefersReducedMotion) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-end justify-between bg-[var(--foreground)] px-6 py-8 text-white sm:px-10 sm:py-10"
    >
      <span className="font-serif text-sm tracking-[0.2em] uppercase text-white/70">
        Siteryo
      </span>
      <span className="font-serif text-2xl tabular-nums">
        <span ref={countRef}>0</span>%
      </span>
    </div>
  );
}
