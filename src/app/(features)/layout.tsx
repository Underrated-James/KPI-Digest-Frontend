import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import Image from "next/image";

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen bg-zinc-950 w-full">
          <AppSidebar />

          <div className="flex flex-col flex-1 min-w-0">
            {/* MOBILE HEADER */}
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur md:hidden">
              <div className="flex items-center gap-3">
                <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src="/logo/Agile Logo.png"
                    alt="Agile Digest Logo"
                    width={18}
                    height={18}
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-xl font-bold tracking-tight text-white font-nevera">
                  Agile Digest
                </span>
              </div>

              <SidebarTrigger className="size-10 rounded-xl border border-zinc-800/80 bg-zinc-900/80 text-white hover:border-zinc-700 hover:bg-zinc-900" />
            </header>
            {/* CONTENT */}
            <main className="flex-1 w-full overflow-hidden">
              <div className="h-full p-4 lg:p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
