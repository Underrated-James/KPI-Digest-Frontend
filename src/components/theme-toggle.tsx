"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "ghost" | "outline";
}

export const ThemeToggle = ({
  showLabel = false,
  size = "default",
  variant = "ghost",
}: ThemeToggleProps) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const iconSizeMap = {
    default: "h-4 w-4",
    sm: "h-3 w-3",
    lg: "h-5 w-5",
  } as const;

  const iconSize = iconSizeMap[size];

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        aria-label="Loading theme toggle"
      >
        <Sun className={iconSize} />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          aria-label={`Current theme: ${theme}. Open theme menu`}
          title={`Current theme: ${theme}`}
          className="relative transition-colors duration-200"
        >
          <Sun
            className={`${iconSize} absolute transition-all duration-200 ${
              resolvedTheme === "light"
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-90 scale-0 opacity-0"
            }`}
          />
          <Moon
            className={`${iconSize} absolute transition-all duration-200 ${
              resolvedTheme === "dark"
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0"
            }`}
          />
          <span className="invisible">
            <Sun className={iconSize} />
          </span>

          {showLabel ? <span className="ml-2 capitalize text-sm">{theme}</span> : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          aria-label="Switch to light mode"
          className={theme === "light" ? "bg-accent" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" ? <span className="ml-auto">OK</span> : null}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          aria-label="Switch to dark mode"
          className={theme === "dark" ? "bg-accent" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" ? <span className="ml-auto">OK</span> : null}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          aria-label="Use system preference"
          className={theme === "system" ? "bg-accent" : ""}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" ? <span className="ml-auto">OK</span> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
