"use client";

import { motion } from "motion/react";
import MagneticButton from "@/components/MagneticButton";
import RevealText from "@/components/RevealText";

export default function Contact() {
  return (
    <section
      id="contacto"
      className="relative overflow-hidden bg-[var(--foreground)] px-6 py-28 text-white sm:px-10 sm:py-36"
    >
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <RevealText
            as="h2"
            lines={["Hablemos de tu", "próxima propiedad."]}
            className="font-serif text-3xl leading-tight sm:text-5xl"
          />
          <p className="mt-6 max-w-sm text-sm text-white/60">
            Cuéntanos qué buscas y un asesor especializado en arquitectura
            residencial te contactará en menos de 24 horas.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="flex flex-col gap-2 text-xs tracking-wide text-white/60">
            Nombre
            <input
              type="text"
              className="border-b border-white/20 bg-transparent py-2 text-white outline-none transition-colors focus:border-[var(--accent)]"
              placeholder="Tu nombre"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs tracking-wide text-white/60">
            Email
            <input
              type="email"
              className="border-b border-white/20 bg-transparent py-2 text-white outline-none transition-colors focus:border-[var(--accent)]"
              placeholder="tu@email.com"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs tracking-wide text-white/60">
            Mensaje
            <textarea
              rows={3}
              className="resize-none border-b border-white/20 bg-transparent py-2 text-white outline-none transition-colors focus:border-[var(--accent)]"
              placeholder="Cuéntanos qué tipo de propiedad buscas"
            />
          </label>
          <MagneticButton
            as="button"
            type="submit"
            strength={0.35}
            className="mt-4 w-fit rounded-full bg-[var(--accent)] px-8 py-3 text-sm tracking-wide text-[var(--foreground)]"
          >
            Enviar consulta
          </MagneticButton>
        </motion.form>
      </div>

      <div className="mx-auto mt-24 flex max-w-6xl flex-col justify-between gap-6 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row">
        <span>© {new Date().getFullYear()} Siteryo. Todos los derechos reservados.</span>
        <span>Madrid · Barcelona · Marbella</span>
      </div>
    </section>
  );
}
