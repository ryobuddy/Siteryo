"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const VERT = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Blends the two nearest frames (uBlend) instead of hard-cutting, same
// reasoning as CinematicReveal's canvas cross-fade: a scroll-scrubbed
// sequence this coarse flickers on a hard cut once scroll speeds up.
// Distortion/grain/aberration are applied identically to both samples,
// then the colors mix — the WebGL equivalent of what WebGLVideoHero did
// with a live <video> texture, just with two static frame textures.
const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTextureA;
uniform sampler2D uTextureB;
uniform float uBlend;
uniform vec2 uMouse;
uniform float uHover;
uniform float uTime;
uniform vec2 uScale;
uniform vec2 uOffset;

float random(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 toMouse = vUv - uMouse;
  float dist = length(toMouse);
  float falloff = smoothstep(0.5, 0.0, dist);
  vec2 dir = dist > 0.0001 ? toMouse / dist : vec2(0.0);
  float ripple = sin(dist * 40.0 - uTime * 2.4) * 0.01;
  vec2 displaced = vUv + dir * falloff * uHover * (0.035 + ripple);

  vec2 coverUv = (displaced - 0.5) * uScale + 0.5 + uOffset;
  coverUv = clamp(coverUv, 0.0, 1.0);

  vec3 colorA = texture(uTextureA, coverUv).rgb;
  vec3 colorB = texture(uTextureB, coverUv).rgb;
  vec3 color = mix(colorA, colorB, uBlend);

  float aberration = falloff * uHover * 0.005;
  color.r = mix(texture(uTextureA, coverUv + dir * aberration).r, texture(uTextureB, coverUv + dir * aberration).r, uBlend);
  color.b = mix(texture(uTextureA, coverUv - dir * aberration).b, texture(uTextureB, coverUv - dir * aberration).b, uBlend);

  float grain = (random(vUv * fract(uTime * 24.0) * 400.0) - 0.5) * 0.028;
  color += grain;

  fragColor = vec4(color, 1.0);
}`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function WebGLScrollHero({
  frameCount,
  frameSrc,
  poster,
  sectionRef,
  className,
}: {
  frameCount: number;
  frameSrc: (index: number) => string;
  poster: string;
  sectionRef: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const progressRef = useRef(0);
  const smoothedRef = useRef(0);
  const [framesReady, setFramesReady] = useState(false);
  const [supported, setSupported] = useState(true);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled = supported && !prefersReducedMotion;

  // Preload the frame sequence.
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const images: HTMLImageElement[] = [];
    let loaded = 0;
    for (let i = 0; i < frameCount; i++) {
      const img = new window.Image();
      img.src = frameSrc(i);
      img.onload = () => {
        loaded++;
        if (loaded === frameCount && !cancelled) setFramesReady(true);
      };
      images.push(img);
    }
    imagesRef.current = images;
    return () => {
      cancelled = true;
    };
  }, [enabled, frameCount, frameSrc]);

  // Scroll progress over the section's own scroll range — no autoplay,
  // no loop: the frame shown is purely a function of scroll position.
  useEffect(() => {
    if (!enabled || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });
    });
    return () => ctx.revert();
  }, [enabled, sectionRef]);

  useEffect(() => {
    if (!enabled || !framesReady) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const gl = canvas.getContext("webgl2", { alpha: false, antialias: true });
    if (!gl) {
      setSupported(false);
      return;
    }

    const vertShader = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vertShader || !fragShader || !program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uHover = gl.getUniformLocation(program, "uHover");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uScale = gl.getUniformLocation(program, "uScale");
    const uOffset = gl.getUniformLocation(program, "uOffset");
    const uTextureA = gl.getUniformLocation(program, "uTextureA");
    const uTextureB = gl.getUniformLocation(program, "uTextureB");
    const uBlend = gl.getUniformLocation(program, "uBlend");

    function makeTexture() {
      const tex = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
      gl!.texImage2D(
        gl!.TEXTURE_2D,
        0,
        gl!.RGBA,
        1,
        1,
        0,
        gl!.RGBA,
        gl!.UNSIGNED_BYTE,
        new Uint8Array([20, 18, 15, 255])
      );
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      return tex!;
    }
    const textureA = makeTexture();
    const textureB = makeTexture();
    let loadedIndexA = -1;
    let loadedIndexB = -1;

    let scaleX = 1;
    let scaleY = 1;
    let offsetX = 0;
    let offsetY = 0;

    function updateCover(imgW: number, imgH: number) {
      const canvasEl = canvasRef.current;
      if (!canvasEl || !imgW || !imgH) return;
      const canvasAspect = canvasEl.clientWidth / canvasEl.clientHeight;
      const imageAspect = imgW / imgH;
      if (imageAspect > canvasAspect) {
        scaleX = canvasAspect / imageAspect;
        scaleY = 1;
      } else {
        scaleX = 1;
        scaleY = imageAspect / canvasAspect;
      }
      offsetX = (1 - scaleX) / 2;
      offsetY = (1 - scaleY) / 2;
    }

    const mouse = { x: 0.5, y: 0.5 };
    const targetMouse = { x: 0.5, y: 0.5 };
    let hover = 0;
    let targetHover = 0;

    function handleMove(e: PointerEvent) {
      const rect = wrap!.getBoundingClientRect();
      targetMouse.x = (e.clientX - rect.left) / rect.width;
      targetMouse.y = (e.clientY - rect.top) / rect.height;
    }
    function handleEnter() {
      targetHover = 1;
    }
    function handleLeave() {
      targetHover = 0;
    }
    wrap.addEventListener("pointermove", handleMove);
    wrap.addEventListener("pointerenter", handleEnter);
    wrap.addEventListener("pointerleave", handleLeave);

    function resize() {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvasEl.clientWidth * dpr;
      const h = canvasEl.clientHeight * dpr;
      if (canvasEl.width !== w || canvasEl.height !== h) {
        canvasEl.width = w;
        canvasEl.height = h;
        gl!.viewport(0, 0, w, h);
      }
      const first = imagesRef.current[0];
      if (first?.complete) updateCover(first.naturalWidth, first.naturalHeight);
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    resize();

    let rafId = 0;
    const start = performance.now();
    function render(now: number) {
      rafId = requestAnimationFrame(render);

      smoothedRef.current += (progressRef.current - smoothedRef.current) * 0.12;
      mouse.x += (targetMouse.x - mouse.x) * 0.12;
      mouse.y += (targetMouse.y - mouse.y) * 0.12;
      hover += (targetHover - hover) * 0.08;

      const images = imagesRef.current;
      const lastIndex = images.length - 1;
      const position = clamp(smoothedRef.current * lastIndex, 0, lastIndex);
      const i0 = Math.floor(position);
      const i1 = Math.min(i0 + 1, lastIndex);
      const frac = position - i0;

      if (i0 !== loadedIndexA && images[i0]?.complete) {
        gl!.bindTexture(gl!.TEXTURE_2D, textureA);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, images[i0]);
        loadedIndexA = i0;
      }
      if (i1 !== loadedIndexB && images[i1]?.complete) {
        gl!.bindTexture(gl!.TEXTURE_2D, textureB);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, images[i1]);
        loadedIndexB = i1;
      }

      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, textureA);
      gl!.uniform1i(uTextureA, 0);
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, textureB);
      gl!.uniform1i(uTextureB, 1);

      gl!.uniform1f(uBlend, frac);
      gl!.uniform2f(uMouse, mouse.x, 1 - mouse.y);
      gl!.uniform1f(uHover, hover);
      gl!.uniform1f(uTime, (now - start) / 1000);
      gl!.uniform2f(uScale, scaleX, scaleY);
      gl!.uniform2f(uOffset, offsetX, offsetY);

      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      wrap.removeEventListener("pointermove", handleMove);
      wrap.removeEventListener("pointerenter", handleEnter);
      wrap.removeEventListener("pointerleave", handleLeave);
      gl.deleteProgram(program);
      gl.deleteTexture(textureA);
      gl.deleteTexture(textureB);
      gl.deleteBuffer(positionBuffer);
    };
  }, [enabled, framesReady]);

  if (!enabled) {
    return (
      <Image src={poster} alt="" aria-hidden fill sizes="100vw" className={className} />
    );
  }

  return (
    <div ref={wrapRef} className="absolute inset-0 h-full w-full">
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`${className ?? ""} transition-opacity duration-500 ${
          framesReady ? "opacity-100" : "opacity-0"
        }`}
      />
      {!framesReady && (
        <Image src={poster} alt="" aria-hidden fill sizes="100vw" className={className} />
      )}
    </div>
  );
}
