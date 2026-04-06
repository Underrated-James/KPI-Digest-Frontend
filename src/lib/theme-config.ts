/**
 * Theme Configuration
 *
 * This file defines all theme tokens used across the application.
 * Each token is semantically named to represent its purpose.
 *
 * Color Space: OKLch (Oklch - Oklab with cylindrical representation)
 * Benefits over RGB/HSL:
 * - Perceptually uniform
 * - Better for a11y (contrast ratios)
 * - More intuitive for theme design
 *
 * Format: oklch(lightness saturation hue)
 * - Lightness: 0-1 (0 = black, 1 = white)
 * - Saturation: 0-0.4 (0 = grayscale, 0.4 = vibrant)
 * - Hue: 0-360 (degrees on color wheel)
 */

export const themeConfig = {
  light: {
    // Background colors
    "bg-primary": "oklch(1 0 0)", // Pure white
    "bg-secondary": "oklch(0.97 0 0)", // Very light gray
    "bg-tertiary": "oklch(0.94 0 0)", // Light gray

    // Text colors
    "text-primary": "oklch(0.145 0 0)", // Near black
    "text-secondary": "oklch(0.556 0 0)", // Medium gray
    "text-tertiary": "oklch(0.708 0 0)", // Light gray
    "text-disabled": "oklch(0.778 0 0)", // Disabled text

    // Component backgrounds
    "card-bg": "oklch(1 0 0)", // White cards
    "card-hover-bg": "oklch(0.97 0 0)", // Card hover state
    "input-bg": "oklch(0.985 0 0)", // Input backgrounds
    "input-disabled-bg": "oklch(0.94 0 0)", // Disabled input

    // Borders
    "border-primary": "oklch(0.922 0 0)", // Main border color
    "border-secondary": "oklch(0.961 0 0)", // Subtle border

    // Interactive elements
    "button-bg": "oklch(0.205 0 0)", // Button primary (near black)
    "button-text": "oklch(0.985 0 0)", // Button text (white)
    "button-hover-bg": "oklch(0.269 0 0)", // Darker on hover
    "button-disabled-bg": "oklch(0.88 0 0)", // Disabled button
    "button-disabled-text": "oklch(0.708 0 0)", // Disabled button text

    // Focus and states
    "focus-ring": "oklch(0.708 0 0)", // Focus ring color
    "ring-opacity": "0.5",

    // Accent colors
    "accent-primary": "oklch(0.205 0 0)", // Accent color
    "accent-secondary": "oklch(0.97 0 0)", // Accent secondary

    // Semantic colors
    "success-bg": "oklch(0.9 0.1 142)", // Green
    "success-text": "oklch(0.3 0.15 142)",
    "warning-bg": "oklch(0.92 0.15 60)", // Orange
    "warning-text": "oklch(0.4 0.2 60)",
    "error-bg": "oklch(0.7 0.25 27)", // Red
    "error-text": "oklch(0.3 0.3 27)",
    "info-bg": "oklch(0.88 0.1 250)", // Blue
    "info-text": "oklch(0.3 0.2 250)",

    // Sidebar
    "sidebar-bg": "oklch(0.985 0 0)", // Light sidebar
    "sidebar-text": "oklch(0.145 0 0)", // Dark text in sidebar
    "sidebar-hover": "oklch(0.94 0 0)", // Hover state in sidebar
    "sidebar-active": "oklch(0.205 0 0)", // Active state in sidebar
    "sidebar-active-text": "oklch(0.985 0 0)", // Active text color
  },

  dark: {
    // Background colors
    "bg-primary": "oklch(0.145 0 0)", // Near black
    "bg-secondary": "oklch(0.205 0 0)", // Dark gray
    "bg-tertiary": "oklch(0.269 0 0)", // Medium dark gray

    // Text colors
    "text-primary": "oklch(0.985 0 0)", // Near white
    "text-secondary": "oklch(0.708 0 0)", // Medium gray
    "text-tertiary": "oklch(0.556 0 0)", // Light gray
    "text-disabled": "oklch(0.439 0 0)", // Disabled text

    // Component backgrounds
    "card-bg": "oklch(0.205 0 0)", // Dark cards
    "card-hover-bg": "oklch(0.269 0 0)", // Card hover state
    "input-bg": "oklch(0.185 0 0)", // Dark input backgrounds
    "input-disabled-bg": "oklch(0.145 0 0)", // Disabled input

    // Borders
    "border-primary": "oklch(0.371 0 0)", // Main border color
    "border-secondary": "oklch(0.269 0 0)", // Subtle border

    // Interactive elements
    "button-bg": "oklch(0.922 0 0)", // Button primary (near white)
    "button-text": "oklch(0.205 0 0)", // Button text (near black)
    "button-hover-bg": "oklch(0.985 0 0)", // Brighter on hover
    "button-disabled-bg": "oklch(0.269 0 0)", // Disabled button
    "button-disabled-text": "oklch(0.556 0 0)", // Disabled button text

    // Focus and states
    "focus-ring": "oklch(0.708 0 0)", // Focus ring color
    "ring-opacity": "0.4",

    // Accent colors
    "accent-primary": "oklch(0.922 0 0)", // Accent color (light)
    "accent-secondary": "oklch(0.269 0 0)", // Accent secondary

    // Semantic colors
    "success-bg": "oklch(0.3 0.15 142)", // Dark green
    "success-text": "oklch(0.85 0.1 142)",
    "warning-bg": "oklch(0.35 0.2 60)", // Dark orange
    "warning-text": "oklch(0.9 0.15 60)",
    "error-bg": "oklch(0.35 0.3 27)", // Dark red
    "error-text": "oklch(0.85 0.25 27)",
    "info-bg": "oklch(0.3 0.2 250)", // Dark blue
    "info-text": "oklch(0.8 0.15 250)",

    // Sidebar
    "sidebar-bg": "oklch(0.17 0 0)", // Dark sidebar
    "sidebar-text": "oklch(0.88 0 0)", // Light text in sidebar
    "sidebar-hover": "oklch(0.25 0 0)", // Hover state in sidebar
    "sidebar-active": "oklch(0.922 0 0)", // Active state in sidebar (light)
    "sidebar-active-text": "oklch(0.205 0 0)", // Active text color
  },
};

/**
 * Generate CSS variable declarations for a given theme
 * Usage in globals.css:
 * :root {
 *   @apply var(--light-theme-vars);
 * }
 * .dark {
 *   @apply var(--dark-theme-vars);
 * }
 */
export const generateThemeVars = (
  theme: "light" | "dark",
): Record<string, string> => {
  const colors = themeConfig[theme];
  const vars: Record<string, string> = {};

  Object.entries(colors).forEach(([key, value]) => {
    vars[`--${key}`] = value;
  });

  return vars;
};
