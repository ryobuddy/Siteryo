import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[var(--foreground)] px-6 text-center text-white">
      <p className="text-xs uppercase tracking-[0.15em] text-white/50">Error 404</p>
      <h1 className="font-serif text-5xl leading-tight sm:text-7xl">
        Esta propiedad
        <br />
        no existe.
      </h1>
      <p className="max-w-sm text-sm text-white/60">
        El enlace puede estar roto o la página ya no está disponible.
        Volvamos a algo que sí existe.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-white/85"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
