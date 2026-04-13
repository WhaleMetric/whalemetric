import ThemeProvider from "@/components/client/ThemeProvider";
import Sidebar from "@/components/client/Sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-white dark:bg-[#0A0A0A]">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </ThemeProvider>
  );
}
