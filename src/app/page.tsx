import Hero from "@/components/Hero";
import CutoutParallaxReveal from "@/components/CutoutParallaxReveal";
import Properties from "@/components/Properties";
import Stats from "@/components/Stats";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <CutoutParallaxReveal />
      <Stats />
      <Properties />
      <Contact />
    </main>
  );
}
