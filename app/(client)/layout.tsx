import type { Metadata } from "next";
import ThemeProvider from "@/components/client/ThemeProvider";
import Sidebar from "@/components/client/Sidebar";
import "./client.css";

export const metadata: Metadata = {
  title: "WhaleMetric",
  description: "Portal cliente WhaleMetric",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <Sidebar />
          <main className="client-main">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
