"use client";

import { useRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";

type MagneticButtonProps =
  | ({ as: "button"; strength?: number; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ as?: "a"; strength?: number; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>);

export default function MagneticButton({
  as = "a",
  strength = 0.4,
  className,
  children,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (prefersReducedMotion) return;
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = e.clientX - bounds.left - bounds.width / 2;
    const y = e.clientY - bounds.top - bounds.height / 2;
    gsap.to(ref.current, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: "power3.out",
    });
  }

  function handleMouseLeave() {
    if (prefersReducedMotion) return;
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
  }

  if (as === "button") {
    return (
      <button
        ref={ref}
        className={className}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
    >
      {children}
    </a>
  );
}
