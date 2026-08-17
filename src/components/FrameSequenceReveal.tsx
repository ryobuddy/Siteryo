"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";

const FRAME_COUNT = 60;
const FRAME_SRC = (i: number) => `/frames/f${String(i).padStart(3, "0")}.jpg`;

function scaleImage(img: HTMLImageElement, ctx: CanvasRenderingContext2D) {
  const canvas = ctx.canvas;
  const hRatio = canvas.width / img.width;
  const vRatio = canvas.height / img.height;
  const ratio = Math.max(hRatio, vRatio);
  const shiftX = (canvas.width - img.width * ratio) / 2;
  const shiftY = (canvas.height - img.height * ratio) / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, img.width, img.height, shiftX, shiftY, img.width * ratio, img.height * ratio);
}

export default function FrameSequenceReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images: HTMLImageElement[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_SRC(i);
      images.push(img);
    }

    const imageSeq = { frame: 0 };

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    }

    function render() {
      const img = images[imageSeq.frame];
      if (img?.complete && ctx) scaleImage(img, ctx);
    }

    images[0].onload = render;
    resize();
    window.addEventListener("resize", resize);

    const ctxGsap = gsap.context(() => {
      if (prefersReducedMotion) {
        imageSeq.frame = FRAME_COUNT - 1;
        images[FRAME_COUNT - 1].onload = render;
        render();
        return;
      }

      gsap.to(imageSeq, {
        frame: FRAME_COUNT - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=200%",
          scrub: 0.6,
          pin: true,
        },
        onUpdate: render,
      });
    }, section);

    return () => {
      window.removeEventListener("resize", resize);
      ctxGsap.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section ref={sectionRef} className="relative h-svh overflow-hidden bg-[var(--foreground)]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/80 via-transparent to-[var(--foreground)]/30" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-16 sm:px-10 sm:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl font-serif text-2xl leading-tight text-white sm:text-4xl"
        >
          Cada propiedad se revela como se merece: despacio, en vuelo, sin prisa.
        </motion.p>
      </div>

      <span className="pointer-events-none absolute bottom-3 right-4 text-[10px] tracking-wide text-white/35 sm:bottom-4 sm:right-6">
        Vuelo de dron: Keila-Joa Manor, Estonia · Sillerkiil, CC BY-SA 4.0, Wikimedia Commons
      </span>
    </section>
  );
}
