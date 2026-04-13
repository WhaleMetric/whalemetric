import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "WhaleMetric — Inteligencia mediatica para organizaciones que no pueden permitirse no saber",
  description:
    "WhaleMetric captura en tiempo real todo lo que emiten las televisiones, radios, periodicos, medios digitales y redes sociales. Lo analiza con IA y te entrega lo que importa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Geist:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
