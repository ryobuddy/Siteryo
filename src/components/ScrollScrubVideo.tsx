"use client";

import { useEffect, useRef, type RefObject } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";

// The canonical GSAP technique for scroll-scrubbed video: tween the
// <video>'s own currentTime against ScrollTrigger's progress. No custom
// frame extraction, no canvas, no WebGL — the browser's own video
// decoder does the work. Replaces the earlier hand-built
// WebGLScrollHero (41 preloaded WebP frames drawn to a canvas), which
// existed only because CinematicReveal's alpha-cutout use case needs
// frame-level control that a plain <video> can't give you. The hero
// background has no transparency requirement, so there was no reason
// not to use the library's own answer to this exact problem.
export default function ScrollScrubVideo({
  src,
  webmSrc,
  poster,
  sectionRef,
  className,
}: {
  src: string;
  webmSrc?: string;
  poster: string;
  sectionRef: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (prefersReducedMotion) return;
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    let ctx: gsap.Context | undefined;
    function bind() {
      if (!video || !section || !video.duration) return;
      ctx = gsap.context(() => {
        gsap.to(video, {
          currentTime: video.duration,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }

    if (video.readyState >= 1) {
      bind();
    } else {
      video.addEventListener("loadedmetadata", bind, { once: true });
    }

    return () => {
      video.removeEventListener("loadedmetadata", bind);
      ctx?.revert();
    };
  }, [prefersReducedMotion, sectionRef]);

  if (prefersReducedMotion) {
    return <Image src={poster} alt="" aria-hidden fill sizes="100vw" className={className} />;
  }

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      playsInline
      preload="auto"
      poster={poster}
      aria-hidden
    >
      {webmSrc && <source src={webmSrc} type="video/webm" />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
