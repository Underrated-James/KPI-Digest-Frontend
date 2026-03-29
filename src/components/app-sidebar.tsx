"use client";

import {
  LayoutDashboard,
  LogOut,
  Folder,
  Users,
  Ticket,
  Layers,
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
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="bg-zinc-950 border-r border-zinc-800">
      {/* HEADER */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-sky-400 shrink-0" size={24} />
          {(!isCollapsed || isMobile) && (
            <span className="text-xl font-bold tracking-tight text-white font-nevera">
              Agile Digest
            </span>
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