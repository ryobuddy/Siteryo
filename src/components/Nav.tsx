"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import MagneticButton from "@/components/MagneticButton";

const links = [
  { label: "Propiedades", href: "#propiedades" },
  { label: "Estudio", href: "#" },
  { label: "Proceso", href: "#" },
  { label: "Contacto", href: "#contacto" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    return () => document.documentElement.classList.remove("menu-open");
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[var(--foreground)]/75 px-6 py-5 backdrop-blur-md sm:px-10"
      >
        <span className="font-serif text-lg tracking-[0.2em] text-white uppercase">
          Siteryo
        </span>
        <nav className="hidden gap-10 text-sm tracking-wide text-white/75 sm:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="group relative py-1 transition-colors hover:text-white"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 h-px w-0 bg-[var(--accent)] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <MagneticButton
          href="#contacto"
          strength={0.5}
          className="hidden rounded-full border border-white/25 px-5 py-2 text-sm tracking-wide text-white transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] sm:inline-block"
        >
          Agendar visita
        </MagneticButton>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="relative flex h-8 w-8 flex-col items-center justify-center gap-1.5 sm:hidden"
        >
          <span
            className={`h-px w-5 bg-white transition-transform duration-300 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-5 bg-white transition-transform duration-300 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col justify-center gap-8 bg-[var(--foreground)] px-8 sm:hidden"
          >
            {links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-4xl text-white"
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="#contacto"
              onClick={() => setOpen(false)}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.08 * links.length, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 w-fit rounded-full border border-white/25 px-6 py-3 text-sm tracking-wide text-white"
            >
              Agendar visita
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
