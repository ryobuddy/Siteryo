"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

type RevealTextProps = {
  lines: string[];
  as?: "div" | "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
};

export default function RevealText({
  lines,
  as: Tag = "div",
  className,
  delay = 0,
}: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const targets = ref.current.querySelectorAll("[data-reveal-line]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1,
          delay,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [delay]);

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} className="block overflow-hidden">
          <span data-reveal-line className="block">
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
