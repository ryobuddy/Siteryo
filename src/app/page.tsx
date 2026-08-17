import Hero from "@/components/Hero";
import CinematicReveal from "@/components/CinematicReveal";
import Properties from "@/components/Properties";
import Stats from "@/components/Stats";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <CinematicReveal />
      <Stats />
      <Properties />
      <Contact />
    </main>
  );
}
