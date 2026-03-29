"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LogOut,
  Folder,
  Users,
  Ticket,
  Layers,
  PanelLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/base/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/base/ui/tooltip";

const navItems = [
  { name: "Projects", href: "/projects", icon: Folder },
  { name: "Sprints", href: "/sprints", icon: Layers },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Users", href: "/users", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);

  return (
    <Sidebar collapsible="icon" className="bg-zinc-950 border-r border-zinc-800">
      {/* HEADER */}
      <SidebarHeader 
        className="p-4 h-16 flex items-center justify-center transition-all duration-300"
        onMouseEnter={() => setIsHoveringHeader(true)}
        onMouseLeave={() => setIsHoveringHeader(false)}
      >
        <div className="flex items-center gap-3 w-full">
          {isCollapsed && !isMobile ? (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSidebar}
                    className="flex h-12 w-12 items-center justify-center rounded-lg hover:bg-zinc-800 transition-all duration-300 group/trigger"
                  >
                    <div className="relative h-8 w-8">
                      <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                        isHoveringHeader ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"
                      }`}>
                        <Image
                          src="/logo/Agile Logo.png"
                          alt="Agile Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <PanelLeft 
                        className={`absolute inset-0 text-sky-400 transition-all duration-500 ease-in-out ${
                          isHoveringHeader ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
                        }`} 
                      />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-zinc-800 text-white border-zinc-700">
                  Open sidebar
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="flex items-center justify-between w-full px-2 group/header">
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
                <span className="text-xl font-bold tracking-tight text-white font-nevera whitespace-nowrap overflow-hidden transition-all duration-300">
                  Agile Digest
                </span>
              </div>
              {!isMobile && (
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={toggleSidebar}
                        className="opacity-0 group-hover/header:opacity-100 p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-300"
                      >
                        <PanelLeft className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-zinc-800 text-white border-zinc-700">
                      Close sidebar
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <TooltipProvider>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      {isCollapsed && !isMobile ? (
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              className="group outline-none focus-visible:ring-0 focus:ring-0"
                            >
                              <Link
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
                              >
                                <Icon
                                  size={18}
                                  className={`${
                                    isActive
                                      ? "text-sky-400"
                                      : "text-zinc-400 group-hover:text-white"
                                  } shrink-0`}
                                />
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-zinc-800 text-white border-zinc-700">
                            {item.name}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className="group outline-none focus-visible:ring-0 focus:ring-0"
                        >
                          <Link
                            href={item.href}
                            onClick={() => {
                              if (isMobile) {
                                setOpenMobile(false);
                              }
                            }}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
                          >
                            <Icon
                              size={18}
                              className={`${
                                isActive
                                  ? "text-sky-400"
                                  : "text-zinc-400 group-hover:text-white"
                              } shrink-0`}
                            />
                            <span
                              className={`${
                                isActive
                                  ? "text-sky-400 font-medium"
                                  : "text-zinc-400 group-hover:text-white"
                              } truncate`}
                            >
                              {item.name}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </TooltipProvider>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-4 border-t border-zinc-800">
        <button 
          className="flex items-center gap-3 w-full text-sm text-zinc-400 hover:text-red-400 transition outline-none"
          onClick={() => {
            if (isMobile) {
              setOpenMobile(false);
            }
          }}
        >
          <LogOut size={16} className="shrink-0" />
          {(!isCollapsed || isMobile) && <span>Logout</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}