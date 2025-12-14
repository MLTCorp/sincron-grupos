import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SearchCommandProvider } from "@/components/dashboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchCommandProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 min-h-screen bg-background">
        {/* Subtle grid pattern */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(128, 128, 128, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(128, 128, 128, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }}
        />

        <div className="relative">
          {/* Header mobile - apenas trigger da sidebar */}
          <header className="flex items-center p-3 md:p-4 border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10 md:hidden">
            <SidebarTrigger className="p-2 rounded-lg hover:bg-muted transition-colors" />
          </header>

          {/* Conteudo principal */}
          <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
        </main>
      </SidebarProvider>
    </SearchCommandProvider>
  );
}
