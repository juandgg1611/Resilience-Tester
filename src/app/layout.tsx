import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EHCOPEK — Resilience Simulator",
  description: "Triángulo de Resiliencia · Gestión de Crisis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ background: "#f5f3ef" }}>{children}</body>
    </html>
  );
}
