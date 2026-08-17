"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useMediaQuery } from "@/lib/useMediaQuery";

const VERT = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uHover;
uniform float uTime;
uniform vec2 uScale;
uniform vec2 uOffset;

void main() {
  vec2 toMouse = vUv - uMouse;
  float dist = length(toMouse);
  float falloff = smoothstep(0.42, 0.0, dist);
  vec2 dir = dist > 0.0001 ? toMouse / dist : vec2(0.0);
  float ripple = sin(dist * 36.0 - uTime * 3.2) * 0.012;
  vec2 displaced = vUv + dir * falloff * uHover * (0.055 + ripple);
  vec2 coverUv = (displaced - 0.5) * uScale + 0.5 + uOffset;
  coverUv = clamp(coverUv, 0.0, 1.0);
  fragColor = texture(uTexture, coverUv);
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

export default function DistortImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canUseWebgl = useMediaQuery("(hover: hover) and (pointer: fine)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled = canUseWebgl && !prefersReducedMotion;

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const gl = canvas.getContext("webgl2", { alpha: false, antialias: true });
    if (!gl) return;

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
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const positionLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uHover = gl.getUniformLocation(program, "uHover");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uScale = gl.getUniformLocation(program, "uScale");
    const uOffset = gl.getUniformLocation(program, "uOffset");

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([20, 18, 15, 255])
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    let scaleX = 1;
    let scaleY = 1;
    let offsetX = 0;
    let offsetY = 0;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      updateCover(img.width, img.height);
    };

    function updateCover(imgW: number, imgH: number) {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
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
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    resize();

    let rafId = 0;
    const start = performance.now();
    function render(now: number) {
      mouse.x += (targetMouse.x - mouse.x) * 0.12;
      mouse.y += (targetMouse.y - mouse.y) * 0.12;
      hover += (targetHover - hover) * 0.08;

      gl!.uniform2f(uMouse, mouse.x, 1 - mouse.y);
      gl!.uniform1f(uHover, hover);
      gl!.uniform1f(uTime, (now - start) / 1000);
      gl!.uniform2f(uScale, scaleX, scaleY);
      gl!.uniform2f(uOffset, offsetX, offsetY);

      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(render);
    }
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      wrap.removeEventListener("pointermove", handleMove);
      wrap.removeEventListener("pointerenter", handleEnter);
      wrap.removeEventListener("pointerleave", handleLeave);
      gl.deleteProgram(program);
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
    };
  }, [enabled, src]);

  if (!enabled) {
    return (
      <Image
        data-card-image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
        className={className}
      />
    );
  }

  return (
    <div ref={wrapRef} data-card-image className="absolute inset-0 h-full w-full">
      <canvas ref={canvasRef} aria-label={alt} className="h-full w-full" />
    </div>
  );
}
