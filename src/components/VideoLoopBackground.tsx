"use client";

import { useMediaQuery } from "@/lib/useMediaQuery";

type VideoLoopBackgroundProps = {
  src: string;
  webmSrc?: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
};

export default function VideoLoopBackground({
  src,
  webmSrc,
  fallbackSrc,
  alt,
  className,
}: VideoLoopBackgroundProps) {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  if (prefersReducedMotion) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={fallbackSrc} alt={alt} className={className} />;
  }

  return (
    <video
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-label={alt}
      poster={fallbackSrc}
    >
      {webmSrc && <source src={webmSrc} type="video/webm" />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
