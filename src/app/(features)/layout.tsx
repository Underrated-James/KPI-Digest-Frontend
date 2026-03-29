import { SidebarProvider, SidebarTrigger } from "@/components/base/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Image from "next/image";

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-zinc-950 w-full"> 
        <AppSidebar />
        
        <div className="flex flex-col flex-1 min-w-0">
          {/* MOBILE HEADER */}
          <header className="flex lg:hidden items-center justify-between px-4 h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-40">
             <div className="flex items-center gap-3">
               <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                 <Image
                   src="/logo/Agile Logo.png"
                   alt="Agile Digest Logo"
                   fill
                   className="object-contain"
                   priority
                 />
               </div>
              <span className="text-xl font-bold tracking-tight text-white font-nevera">
                Agile Digest
              </span>
            </div>
            <SidebarTrigger />
          </header>

          {/* DESKTOP HEADER */}
          <header className="hidden lg:flex items-center h-16 border-b border-zinc-800 px-8 bg-zinc-950/50 sticky top-0 z-30">
            <SidebarTrigger />
          </header>

          {/* CONTENT */}
          <main className="flex-1 w-full overflow-y-auto">
            <div className="p-4 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}