"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";

type VideoScrubRevealProps = {
  /** MP4 (H.264) source — see README for export specs. */
  src: string;
  /** Static frame shown while the video loads or on prefers-reduced-motion. */
  poster: string;
  className?: string;
};

export default function VideoScrubReveal({ src, poster, className }: VideoScrubRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || prefersReducedMotion) return;

    function handleLoaded() {
      setReady(true);
    }
    video.addEventListener("loadedmetadata", handleLoaded);

    const ctx = gsap.context(() => {
      const proxy = { time: 0 };
      gsap.to(proxy, {
        time: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=160%",
          scrub: 0.6,
          pin: true,
        },
        onUpdate: () => {
          if (video.duration) video.currentTime = proxy.time * video.duration;
        },
      });
    }, section);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section ref={sectionRef} className={`relative h-svh overflow-hidden bg-[var(--foreground)] ${className ?? ""}`}>
      <Image
        src={poster}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className={`object-cover transition-opacity duration-500 ${
          ready && !prefersReducedMotion ? "opacity-0" : "opacity-100"
        }`}
      />
      {!prefersReducedMotion && (
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/70 via-transparent to-[var(--foreground)]/20" />
    </section>
  );
}
