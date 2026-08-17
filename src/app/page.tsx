import Hero from "@/components/Hero";
import FrameSequenceReveal from "@/components/FrameSequenceReveal";
import Properties from "@/components/Properties";
import Stats from "@/components/Stats";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <FrameSequenceReveal />
      <Stats />
      <Properties />
      <Contact />
    </main>
  );
}
