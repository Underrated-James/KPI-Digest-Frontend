"use client";

import * as React from "react";
import {
  Users,
  Briefcase,
  CheckSquare,
  ChevronDown,
  Users2,
  Settings,
  LogOut,
  CalendarDays,
  Moon,
  Monitor,
  PanelLeft,
  Sun,
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
import { useTheme, type Theme } from "@/lib/theme-context";

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

const sidebarButtonClassName =
  "text-sidebar-foreground/70 transition-all duration-200 hover:bg-[var(--sidebar-hover)] hover:text-sidebar-foreground data-[active=true]:bg-[var(--sidebar-active)] data-[active=true]:text-[var(--sidebar-active-text)] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:hover:bg-transparent";

function SidebarBrandToggle() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "group/brand relative flex items-center rounded-xl border border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        isCollapsed
          ? "size-10 justify-center overflow-hidden shadow-sm hover:-translate-y-0.5 hover:border-sidebar-border hover:bg-[var(--sidebar-hover)] hover:text-sidebar-foreground hover:shadow-md"
          : "h-10 w-full justify-between px-3 hover:border-sidebar-border hover:bg-[var(--sidebar-hover)] hover:text-sidebar-foreground",
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
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </span>
          <PanelLeft className="absolute size-4 translate-x-1 opacity-0 text-current transition-all duration-300 group-hover/brand:translate-x-0 group-hover/brand:opacity-100" />
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
                style={{ width: "auto", height: "auto" }}
                priority
              />
            </div>

            <span className="truncate text-xl font-bold tracking-tight text-current">
              AGILE DIGEST
            </span>
          </div>

          <PanelLeft className="size-4 shrink-0 text-sidebar-foreground/65 transition-all duration-300 group-hover/brand:-translate-x-0.5 group-hover/brand:text-current" />
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
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          sidebarButtonClassName,
          isActive &&
            "shadow-sm group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none",
        )}
      >
        <Link href={item.href} onClick={onNavigate}>
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg text-current transition-all duration-200",
              "group-data-[collapsible=icon]:group-hover/menu-button:scale-105",
              "group-data-[collapsible=icon]:group-hover/menu-button:text-current",
              "group-data-[collapsible=icon]:group-hover/menu-button:bg-[var(--sidebar-hover)] group-data-[collapsible=icon]:group-hover/menu-button:shadow-sm",
              isActive &&
                "text-current group-data-[collapsible=icon]:bg-[var(--sidebar-active)] group-data-[collapsible=icon]:text-[var(--sidebar-active-text)] group-data-[collapsible=icon]:shadow-sm",
            )}
          >
            <item.icon className="size-4" />
          </span>
          <span className="group-data-[collapsible=icon]:hidden">
            {item.title}
          </span>
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
      <SidebarMenuButton tooltip={title} className={sidebarButtonClassName}>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-data-[collapsible=icon]:group-hover/menu-button:scale-105 group-data-[collapsible=icon]:group-hover/menu-button:bg-[var(--sidebar-hover)] group-data-[collapsible=icon]:group-hover/menu-button:text-current group-data-[collapsible=icon]:group-hover/menu-button:shadow-sm">
          <Icon className="size-4" />
        </span>
        <span className="group-data-[collapsible=icon]:hidden">{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarThemeMenu() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayTheme = mounted ? resolvedTheme : "system";
  const ActiveThemeIcon =
    !mounted || theme === "system"
      ? Monitor
      : resolvedTheme === "dark"
        ? Moon
        : Sun;

  return (
    <SidebarMenuItem>
      <div className="group-data-[collapsible=icon]:contents">
        <SidebarMenuButton
          tooltip="Settings"
          className={sidebarButtonClassName}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-data-[collapsible=icon]:group-hover/menu-button:scale-105 group-data-[collapsible=icon]:group-hover/menu-button:bg-[var(--sidebar-hover)] group-data-[collapsible=icon]:group-hover/menu-button:text-current group-data-[collapsible=icon]:group-hover/menu-button:shadow-sm">
            <Settings className="size-4" />
          </span>
          <span className="group-data-[collapsible=icon]:hidden">Settings</span>
          <span className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-lg border border-sidebar-border/80 bg-[var(--sidebar-hover)] text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            <ActiveThemeIcon className="size-4" />
          </span>
          <span className="flex size-7 shrink-0 items-center justify-center text-sidebar-foreground/60 transition-transform duration-200 group-data-[collapsible=icon]:hidden">
            <ChevronDown className={cn("size-4", isOpen && "rotate-180")} />
          </span>
        </SidebarMenuButton>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200 ease-out group-data-[collapsible=icon]:hidden",
            isOpen ? "max-h-48 pt-2 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="rounded-xl border border-sidebar-border bg-[var(--sidebar-hover)]/55 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55">
                Theme
              </div>
              <div
                className="text-xs text-sidebar-foreground/65"
                suppressHydrationWarning
              >
                {displayTheme}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Sun, label: "Light", value: "light" as Theme },
                { icon: Moon, label: "Dark", value: "dark" as Theme },
                { icon: Monitor, label: "System", value: "system" as Theme },
              ].map(({ icon: Icon, label, value }) => {
                const isActive = mounted && theme === value;

                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Switch to ${label.toLowerCase()} theme`}
                    onClick={() => setTheme(value)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs transition-colors",
                      isActive
                        ? "border-sidebar-border bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)]"
                        : "border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-[var(--sidebar-hover)]",
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
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
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border px-4 group-data-[collapsible=icon]:px-1">
        <SidebarBrandToggle />
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            Navigation
          </SidebarGroupLabel>
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

      <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:px-1">
        <SidebarMenu className="gap-1.5">
          <SidebarThemeMenu />
          <SidebarActionButton title="Log out" icon={LogOut} />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
