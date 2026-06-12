import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "Encuesta Así Vamos — Cómo Vamos Nuevo León",
  description:
    "Explorador interactivo de la Encuesta Así Vamos — percepción ciudadana en el AMM 2023–2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${rubik.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
