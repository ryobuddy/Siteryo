"use client";

import { motion } from "motion/react";

const links = ["Propiedades", "Estudio", "Proceso", "Contacto"];

export default function Nav() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 sm:px-10"
    >
      <span className="font-serif text-lg tracking-[0.2em] text-[var(--foreground)] uppercase">
        Siteryo
      </span>
      <nav className="hidden gap-10 text-sm tracking-wide text-[var(--foreground)]/80 sm:flex">
        {links.map((link) => (
          <a
            key={link}
            href="#"
            className="group relative py-1 transition-colors hover:text-[var(--foreground)]"
          >
            {link}
            <span className="absolute bottom-0 left-0 h-px w-0 bg-[var(--accent)] transition-all duration-300 group-hover:w-full" />
          </a>
        ))}
      </nav>
      <a
        href="#contacto"
        className="rounded-full border border-[var(--foreground)]/20 px-5 py-2 text-sm tracking-wide text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        Agendar visita
      </a>
    </motion.header>
  );
}
