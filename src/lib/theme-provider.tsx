"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { ThemeContext, type Theme } from "./theme-context";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableTransitions?: boolean;
}

/**
 * ThemeProvider - Manages light/dark theme state with localStorage persistence
 * and system preference detection.
 *
 * Features:
 * - Persists theme preference to localStorage
 * - Detects system preference (prefers-color-scheme)
 * - Smooth transitions between themes
 * - Prevents hydration mismatch with initial system detection
 * - SSR-safe implementation
 *
 * Usage:
 * ```tsx
 * <ThemeProvider defaultTheme="system" storageKey="app-theme">
 *   <YourApp />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider = ({
  children,
  defaultTheme = "system",
  storageKey = "app-theme",
  enableTransitions = true,
}: ThemeProviderProps) => {
  /**
   * Get system preference for color scheme
   */
  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, []);

  /**
   * Resolve the actual theme to apply (handles 'system' option)
   */
  const resolveTheme = useCallback(
    (currentTheme: Theme): "light" | "dark" => {
      if (currentTheme === "system") {
        return getSystemTheme();
      }
      return currentTheme;
    },
    [getSystemTheme],
  );

  const getInitialTheme = () => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }

    return (localStorage.getItem(storageKey) as Theme | null) || defaultTheme;
  };

  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    resolveTheme(getInitialTheme()),
  );

  const disableTransitionsTemporarily = useCallback(() => {
    const style = document.createElement("style");
    style.appendChild(
      document.createTextNode(
        `*{transition:none!important;animation:none!important;}`,
      ),
    );
    document.head.appendChild(style);

    return () => {
      void window.getComputedStyle(document.body);
      requestAnimationFrame(() => {
        document.head.removeChild(style);
      });
    };
  }, []);

  /**
   * Apply theme to DOM
   */
  const applyTheme = useCallback(
    (themeToApply: "light" | "dark") => {
      const root = document.documentElement;
      const restoreTransitions = enableTransitions
        ? undefined
        : disableTransitionsTemporarily();

      root.style.colorScheme = themeToApply;

      if (themeToApply === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }

      restoreTransitions?.();
    },
    [disableTransitionsTemporarily, enableTransitions],
  );

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme, applyTheme]);

  /**
   * Listen for system theme changes
   */
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setResolvedTheme(resolveTheme("system"));
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, resolveTheme]);

  /**
   * Set new theme and persist to localStorage
   */
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      localStorage.setItem(storageKey, newTheme);

      const resolved = resolveTheme(newTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    },
    [storageKey, resolveTheme, applyTheme],
  );

  /**
   * Toggle between light and dark (respects system if currently using it)
   */
  const toggleTheme = useCallback(() => {
    if (theme === "system") {
      const systemResolved = getSystemTheme();
      const newTheme = systemResolved === "dark" ? "light" : "dark";
      setTheme(newTheme);
    } else {
      const newTheme = theme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    }
  }, [theme, setTheme, getSystemTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
