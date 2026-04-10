import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import Image from "next/image";

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <AppSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            {/* MOBILE HEADER */}
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
              <div className="flex items-center gap-3">
                <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src="/logo/Agile Logo.png"
                    alt="Agile Digest Logo"
                    width={18}
                    height={18}
                    className="object-contain"
                    style={{ width: "auto", height: "auto" }}
                    priority
                  />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  AGILE DIGEST
                </span>
              </div>

              <SidebarTrigger className="size-10 rounded-xl border border-border bg-card text-foreground hover:border-foreground hover:bg-foreground hover:text-background" />
            </header>
            {/* CONTENT */}
            <main className="flex-1 w-full overflow-hidden bg-background">
              <div className="h-full p-4 lg:p-8">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
