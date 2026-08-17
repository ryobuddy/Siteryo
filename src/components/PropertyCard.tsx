"use client";

import { useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { Property } from "@/lib/properties";

export default function PropertyCard({ property }: { property: Property }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 25, stiffness: 300 });
  const springY = useSpring(y, { damping: 25, stiffness: 300 });

  function handleMouseMove(event: MouseEvent<HTMLAnchorElement>) {
    const bounds = cardRef.current?.getBoundingClientRect();
    if (!bounds) return;
    x.set(event.clientX - bounds.left);
    y.set(event.clientY - bounds.top);
  }

  return (
    <a
      ref={cardRef}
      data-card
      href="#"
      onMouseMove={handleMouseMove}
      className={`group relative block overflow-hidden rounded-sm bg-[var(--foreground)]/5 ${
        property.size === "large"
          ? "sm:col-span-2 sm:row-span-2 aspect-[4/5]"
          : "aspect-[4/3] sm:aspect-auto sm:h-full"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- placeholder SVG illustration, swap for next/image once real photography is in */}
      <img
        src={property.image}
        alt={property.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

      <motion.div
        style={{ left: springX, top: springY }}
        className="pointer-events-none absolute z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-medium tracking-wide text-[var(--foreground)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden sm:flex"
      >
        Ver ficha
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
        <div>
          <p className="font-serif text-lg">{property.name}</p>
          <p className="text-xs tracking-wide text-white/70">{property.location}</p>
        </div>
        <div className="text-right text-xs tracking-wide text-white/80 opacity-100 transition-opacity duration-500 sm:opacity-0 sm:group-hover:opacity-100">
          <p>{property.price}</p>
          <p>{property.area}</p>
        </div>
      </div>
    </a>
  );
}
