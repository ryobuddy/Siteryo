"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled = canHover && !prefersReducedMotion;

  useEffect(() => {
    if (!enabled || !dotRef.current || !ringRef.current) return;

    document.body.classList.add("cursor-none-active");

    const dotX = gsap.quickTo(dotRef.current, "x", { duration: 0.1, ease: "power3.out" });
    const dotY = gsap.quickTo(dotRef.current, "y", { duration: 0.1, ease: "power3.out" });
    const ringX = gsap.quickTo(ringRef.current, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ringRef.current, "y", { duration: 0.45, ease: "power3.out" });

    function handleMove(e: MouseEvent) {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    }

    function handleOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const interactive = target.closest("a, button, [data-card]");
      ringRef.current?.classList.toggle("scale-150", Boolean(interactive));
      ringRef.current?.classList.toggle("opacity-40", Boolean(interactive));
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleOver);

    return () => {
      document.body.classList.remove("cursor-none-active");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[70] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[70] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--accent)]/60 transition-[transform,opacity] duration-300"
      />
    </>
  );
}
