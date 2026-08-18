import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { properties } from "@/lib/properties";
import VideoLoopBackground from "@/components/VideoLoopBackground";
import RevealText from "@/components/RevealText";
import FadeInView from "@/components/FadeInView";
import MagneticButton from "@/components/MagneticButton";

export function generateStaticParams() {
  return properties.map((property) => ({ id: property.id }));
}

export async function generateMetadata(
  props: PageProps<"/propiedades/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const property = properties.find((p) => p.id === id);
  if (!property) return {};
  return {
    title: `${property.name} — Siteryo`,
    description: property.description,
  };
}

export default async function PropertyPage(props: PageProps<"/propiedades/[id]">) {
  const { id } = await props.params;
  const property = properties.find((p) => p.id === id);
  if (!property) notFound();

  const others = properties.filter((p) => p.id !== property.id);

  return (
    <main>
      <section className="relative flex h-[75svh] items-end overflow-hidden bg-[var(--foreground)]">
        {property.loopVideo ? (
          <VideoLoopBackground
            src={property.loopVideo}
            webmSrc={property.loopVideoWebm}
            fallbackSrc={property.image}
            alt={`${property.name}, ${property.location} — ${property.description}`}
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
        ) : (
          <Image
            src={property.image}
            alt={`${property.name}, ${property.location} — ${property.description}`}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-90"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)] via-[var(--foreground)]/10 to-[var(--foreground)]/40" />

        <Link
          href="/#propiedades"
          className="absolute left-5 top-24 z-10 text-xs tracking-wide text-white/80 transition-colors hover:text-white sm:left-8 sm:top-28"
        >
          ← Propiedades
        </Link>

        <div className="relative z-10 w-full px-5 pb-14 sm:px-8 sm:pb-20 lg:px-6">
          <FadeInView delay={100} className="mb-2 text-xs uppercase tracking-[0.15em] text-white/70">
            {property.location}
          </FadeInView>
          <RevealText
            as="h1"
            lines={[property.name]}
            className="font-serif text-5xl leading-[0.98] tracking-tight text-white sm:text-6xl md:text-7xl"
            delay={0.1}
          />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 md:px-12">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <FadeInView>
            <p className="text-lg leading-relaxed text-[var(--foreground)]/80 sm:text-xl">
              {property.description}
            </p>
          </FadeInView>
          <FadeInView delay={120}>
            <p className="text-sm leading-relaxed text-[var(--foreground)]/60">
              Ficha de referencia — imágenes y descripción orientativas. Para
              planos, superficie y condiciones concretas, un asesor de
              Siteryo te acompaña en el proceso completo.
            </p>
          </FadeInView>
          <FadeInView delay={220}>
            <MagneticButton
              as="a"
              href="/#contacto"
              strength={0.35}
              className="mt-2 inline-block w-fit rounded-full bg-[var(--foreground)] px-8 py-3 text-sm tracking-wide text-[var(--background)]"
            >
              Consultar por esta propiedad
            </MagneticButton>
          </FadeInView>
        </div>
      </section>

      <section className="border-t border-[var(--foreground)]/10 px-5 py-16 sm:px-8 sm:py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <FadeInView className="mb-10 font-serif text-2xl text-[var(--foreground)] sm:text-3xl">
            Otras propiedades
          </FadeInView>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {others.map((p) => (
              <Link
                key={p.id}
                href={`/propiedades/${p.id}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-sm"
              >
                <Image
                  src={p.image}
                  alt={`${p.name}, ${p.location}`}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-serif text-lg">{p.name}</p>
                  <p className="text-xs tracking-wide text-white/70">{p.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
