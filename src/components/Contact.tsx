"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import MagneticButton from "@/components/MagneticButton";
import RevealText from "@/components/RevealText";

type Status = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Algo salió mal. Inténtalo de nuevo.");
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Algo salió mal. Inténtalo de nuevo.");
    }
  }

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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 p-8"
              >
                <p className="font-serif text-2xl">Mensaje recibido.</p>
                <p className="text-sm text-white/60">
                  Gracias — un asesor de Siteryo te escribirá pronto.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-2 w-fit text-xs tracking-wide text-white/60 underline underline-offset-4 transition-colors hover:text-white"
                >
                  Enviar otro mensaje
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
                onSubmit={handleSubmit}
                noValidate
              >
                <label className="flex flex-col gap-2 text-xs tracking-wide text-white/60">
                  Nombre
                  <input
                    type="text"
                    name="name"
                    required
                    minLength={2}
                    disabled={status === "submitting"}
                    className="border-b border-white/20 bg-transparent py-2 text-white outline-none transition-colors focus:border-[var(--accent)] disabled:opacity-50"
                    placeholder="Tu nombre"
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs tracking-wide text-white/60">
                  Email
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={status === "submitting"}
                    className="border-b border-white/20 bg-transparent py-2 text-white outline-none transition-colors focus:border-[var(--accent)] disabled:opacity-50"
                    placeholder="tu@email.com"
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs tracking-wide text-white/60">
                  Mensaje
                  <textarea
                    name="message"
                    rows={3}
                    required
                    minLength={10}
                    disabled={status === "submitting"}
                    className="resize-none border-b border-white/20 bg-transparent py-2 text-white outline-none transition-colors focus:border-[var(--accent)] disabled:opacity-50"
                    placeholder="Cuéntanos qué tipo de propiedad buscas"
                  />
                </label>

                {status === "error" && (
                  <p role="alert" className="text-xs text-red-300">
                    {errorMessage}
                  </p>
                )}

                <MagneticButton
                  as="button"
                  type="submit"
                  strength={0.35}
                  disabled={status === "submitting"}
                  className="mt-4 w-fit rounded-full bg-[var(--accent)] px-8 py-3 text-sm tracking-wide text-[var(--foreground)] transition-opacity disabled:opacity-60"
                >
                  {status === "submitting" ? "Enviando…" : "Enviar consulta"}
                </MagneticButton>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mx-auto mt-24 flex max-w-6xl flex-col justify-between gap-6 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row">
        <span>© {new Date().getFullYear()} Siteryo. Todos los derechos reservados.</span>
        <span>Madrid · Barcelona · Marbella</span>
      </div>
    </section>
  );
}
