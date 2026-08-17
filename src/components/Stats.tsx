"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

const stats = [
  { label: "Propiedades entregadas", value: 128, suffix: "" },
  { label: "Años de trayectoria", value: 17, suffix: "" },
  { label: "m² gestionados", value: 62, suffix: "K" },
  { label: "Satisfacción de clientes", value: 98, suffix: "%" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20% 0px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 30, stiffness: 90 });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, motionValue, value]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${Math.round(latest)}${suffix}`;
      }
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function Stats() {
  return (
    <section className="border-y border-[var(--foreground)]/10 bg-[var(--background)] px-6 py-20 sm:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center sm:text-left">
            <p className="font-serif text-4xl text-[var(--foreground)] sm:text-5xl">
              <Counter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-xs tracking-wide text-[var(--foreground)]/60">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
