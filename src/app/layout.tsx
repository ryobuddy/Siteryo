import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";
import GrainOverlay from "@/components/GrainOverlay";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Siteryo — Arquitectura residencial de autor",
  description:
    "Propiedades seleccionadas donde el diseño, la luz y el espacio son parte de la inversión.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] font-sans text-[var(--foreground)]">
        <Preloader />
        <Cursor />
        <GrainOverlay />
        <SmoothScroll>
          <Nav />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
