"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { properties } from "@/lib/properties";
import PropertyCard from "@/components/PropertyCard";

export default function Properties() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll("[data-card]");
    const ctx = gsap.context(() => {
      gsap.from(cards, {
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: { each: 0.12, from: "center" },
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="propiedades"
      className="bg-[var(--background)] px-6 py-28 sm:px-10 sm:py-36"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <h2 className="font-serif text-3xl leading-tight text-[var(--foreground)] sm:text-5xl">
            Propiedades
            <br />
            seleccionadas
          </h2>
          <p className="max-w-xs text-sm text-[var(--foreground)]/60">
            Una curaduría de residencias donde arquitectura y ubicación
            justifican cada metro cuadrado.
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
