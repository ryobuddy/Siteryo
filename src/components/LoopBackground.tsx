"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";

type LoopBackgroundProps = {
  frameCount: number;
  frameSrc: (index: number) => string;
  fps?: number;
  fallbackSrc: string;
  alt: string;
  className?: string;
};

export default function LoopBackground({
  frameCount,
  frameSrc,
  fps = 14,
  fallbackSrc,
  alt,
  className,
}: LoopBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const indexRef = useRef(0);
  const inViewRef = useRef(false);
  const [ready, setReady] = useState(false);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (prefersReducedMotion) return;
    let cancelled = false;
    const images: HTMLImageElement[] = [];
    let loaded = 0;
    for (let i = 0; i < frameCount; i++) {
      const img = new window.Image();
      img.src = frameSrc(i);
      img.onload = () => {
        loaded += 1;
        if (loaded === frameCount && !cancelled) setReady(true);
      };
      images.push(img);
    }
    imagesRef.current = images;
    return () => {
      cancelled = true;
    };
  }, [frameCount, frameSrc, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || !ready) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    function resize() {
      if (!canvas || !container) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    function drawFrame() {
      const img = imagesRef.current[indexRef.current];
      if (!img?.complete || !canvas) return;
      const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    }

    let raf = 0;
    let last = 0;
    const interval = 1000 / fps;
    function tick(time: number) {
      raf = requestAnimationFrame(tick);
      if (!inViewRef.current) return;
      if (time - last < interval) return;
      last = time;
      drawFrame();
      indexRef.current = (indexRef.current + 1) % frameCount;
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, [ready, frameCount, fps, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={fallbackSrc} alt={alt} className={className} />
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className={className} aria-label={alt} role="img" />
      {!ready && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallbackSrc}
          alt={alt}
          className={`${className ?? ""} absolute inset-0`}
        />
      )}
    </div>
  );
}
