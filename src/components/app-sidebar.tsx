"use client";

import {
  Users,
  Briefcase,
  CheckSquare,
  Users2,
  Settings,
  LogOut,
  CalendarDays,
  PanelLeft,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  {
    title: "Projects",
    href: "/projects",
    icon: Briefcase,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Teams",
    href: "/teams",
    icon: Users2,
  },
  {
    title: "Sprints",
    href: "/sprints",
    icon: CalendarDays,
  },
  {
    title: "Tickets",
    href: "/tickets",
    icon: CheckSquare,
  },
];

function SidebarBrandToggle() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "group/brand relative flex items-center rounded-xl border border-zinc-800/80 bg-zinc-900/80 text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600",
        isCollapsed
          ? "size-10 justify-center overflow-hidden shadow-[0_12px_30px_-22px_rgba(255,255,255,0.75)] hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-[0_18px_35px_-22px_rgba(255,255,255,0.9)]"
          : "h-10 w-full justify-between px-3 hover:border-zinc-700 hover:bg-zinc-900/95"
      )}
    >
      {isCollapsed ? (
        <div className="relative flex size-6 shrink-0 items-center justify-center">
          <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover/brand:scale-75 group-hover/brand:-translate-x-1 group-hover/brand:opacity-0">
            <Image
              src="/logo/Agile Logo.png"
              alt="Agile Digest Logo"
              width={18}
              height={18}
              className="object-contain"
              priority
            />
          </span>
          <PanelLeft className="absolute size-4 translate-x-1 opacity-0 text-zinc-100 transition-all duration-300 group-hover/brand:translate-x-0 group-hover/brand:opacity-100" />
        </div>
      ) : (
        <>
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex size-6 shrink-0 items-center justify-center">
              <Image
                src="/logo/Agile Logo.png"
                alt="Agile Digest Logo"
                width={18}
                height={18}
                className="object-contain"
                priority
              />
            </div>

            <span className="truncate text-xl font-bold tracking-tight text-white font-nevera">
              Agile Digest
            </span>
          </div>

          <PanelLeft className="size-4 shrink-0 text-zinc-400 transition-all duration-300 group-hover/brand:-translate-x-0.5 group-hover/brand:text-zinc-100" />
        </>
      )}
    </button>
  );
}

function SidebarNavButton({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          "text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-white",
          "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:hover:bg-transparent",
          isActive &&
            "bg-zinc-800 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
        )}
      >
        <Link href={item.href} onClick={onNavigate}>
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg text-current transition-all duration-200",
              "group-data-[collapsible=icon]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0)]",
              "group-data-[collapsible=icon]:group-hover/menu-button:scale-105",
              "group-data-[collapsible=icon]:group-hover/menu-button:text-white",
              "group-data-[collapsible=icon]:group-hover/menu-button:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_10px_24px_-18px_rgba(255,255,255,0.95)]",
              isActive &&
                "text-white group-data-[collapsible=icon]:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_24px_-18px_rgba(255,255,255,0.95)]"
            )}
          >
            <item.icon className="size-4" />
          </span>
          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarActionButton({
  title,
  icon: Icon,
}: {
  title: string;
  icon: LucideIcon;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={title}
        className="text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:hover:bg-transparent"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-data-[collapsible=icon]:group-hover/menu-button:scale-105 group-data-[collapsible=icon]:group-hover/menu-button:text-white group-data-[collapsible=icon]:group-hover/menu-button:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_10px_24px_-18px_rgba(255,255,255,0.95)]">
          <Icon className="size-4" />
        </span>
        <span className="group-data-[collapsible=icon]:hidden">{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  const handleNavItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
      return;
    }

    if (window.innerWidth < 1024) {
      setOpen(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-800 bg-zinc-950">
      <SidebarHeader className="h-16 border-b border-zinc-800 px-4 group-data-[collapsible=icon]:px-1">
        <SidebarBrandToggle />
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarNavButton
                  key={item.title}
                  item={item}
                  pathname={pathname}
                  onNavigate={handleNavItemClick}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-800 p-4 group-data-[collapsible=icon]:px-1">
        <SidebarMenu className="gap-1.5">
          <SidebarActionButton title="Settings" icon={Settings} />
          <SidebarActionButton title="Log out" icon={LogOut} />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
