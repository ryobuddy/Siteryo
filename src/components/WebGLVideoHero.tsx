"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";

const VERT = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Cursor-reactive ripple (same falloff/displacement approach as
// DistortImage) plus two effects that only make sense on a moving source:
// animated per-pixel grain (so the frame never looks perfectly static even
// mid-loop) and a faint chromatic split that only kicks in near the cursor.
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

  float aberration = falloff * uHover * 0.005;
  vec3 color;
  color.r = texture(uTexture, coverUv + dir * aberration).r;
  color.g = texture(uTexture, coverUv).g;
  color.b = texture(uTexture, coverUv - dir * aberration).b;

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

export default function WebGLVideoHero({
  src,
  webmSrc,
  poster,
  className,
}: {
  src: string;
  webmSrc?: string;
  poster: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canUseWebgl = useMediaQuery("(hover: hover) and (pointer: fine)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled = canUseWebgl && !prefersReducedMotion;

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!canvas || !wrap || !video) return;

    const gl = canvas.getContext("webgl2", { alpha: false, antialias: true });
    if (!gl) return;

    video.play().catch(() => {});

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

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let scaleX = 1;
    let scaleY = 1;
    let offsetX = 0;
    let offsetY = 0;

    function updateCover(videoW: number, videoH: number) {
      const canvasEl = canvasRef.current;
      if (!canvasEl || !videoW || !videoH) return;
      const canvasAspect = canvasEl.clientWidth / canvasEl.clientHeight;
      const videoAspect = videoW / videoH;
      if (videoAspect > canvasAspect) {
        scaleX = canvasAspect / videoAspect;
        scaleY = 1;
      } else {
        scaleX = 1;
        scaleY = videoAspect / canvasAspect;
      }
      offsetX = (1 - scaleX) / 2;
      offsetY = (1 - scaleY) / 2;
    }

    function handleLoadedMeta() {
      updateCover(video!.videoWidth, video!.videoHeight);
    }
    video.addEventListener("loadedmetadata", handleLoadedMeta);
    if (video.videoWidth) updateCover(video.videoWidth, video.videoHeight);

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
      updateCover(video!.videoWidth, video!.videoHeight);
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

      if (video!.readyState >= video!.HAVE_CURRENT_DATA) {
        gl!.bindTexture(gl!.TEXTURE_2D, texture);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, video!);
      }

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
      video.removeEventListener("loadedmetadata", handleLoadedMeta);
      wrap.removeEventListener("pointermove", handleMove);
      wrap.removeEventListener("pointerenter", handleEnter);
      wrap.removeEventListener("pointerleave", handleLeave);
      gl.deleteProgram(program);
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
    };
  }, [enabled]);

  if (!enabled) {
    return (
      <video
        className={className}
        autoPlay
        muted
        loop
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

  return (
    <div ref={wrapRef} className="absolute inset-0 h-full w-full">
      <video
        ref={videoRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      >
        {webmSrc && <source src={webmSrc} type="video/webm" />}
        <source src={src} type="video/mp4" />
      </video>
      <canvas ref={canvasRef} aria-hidden className={className} />
    </div>
  );
}
