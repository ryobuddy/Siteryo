export default function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-overlay"
      style={{
        backgroundImage: "url('/grain.jpg')",
        backgroundRepeat: "repeat",
        backgroundSize: "220px 220px",
      }}
    />
  );
}
