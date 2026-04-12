import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { ReduxProvider } from "@/lib/redux-provider";
import { ToastProvider } from "@/lib/toast-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";

const themeStorageKey = "app-theme";
const themeInitScript = `
(() => {
  try {
    const root = document.documentElement;
    const storedTheme = localStorage.getItem("${themeStorageKey}") || "system";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme =
      storedTheme === "system" ? (prefersDark ? "dark" : "light") : storedTheme;

    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  } catch (_) {}
})();
`;

const nevera = localFont({
  src: "../../public/fonts/Nevera-Regular.otf",
  variable: "--font-nevera",
});

export const metadata: Metadata = {
  title: {
    default: "Agile Digest | KPI Digest",
    template: "%s | Agile Digest",
  },
  description:
    "KPI Digest is a tool to help you track and analyze your KPIs. | Agile Digest",
  icons: {
    icon: "/logo/Agile%20Logo.png",
    shortcut: "/logo/Agile%20Logo.png",
    apple: "/logo/Agile%20Logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${nevera.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/png" href="/logo/Agile%20Logo.png" />
        <link
          rel="shortcut icon"
          type="image/png"
          href="/logo/Agile%20Logo.png"
        />
        <link
          rel="apple-touch-icon"
          href="/logo/Agile%20Logo.png"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          defaultTheme="system"
          storageKey={themeStorageKey}
          enableTransitions={false}
        >
          <ReduxProvider>
            <ReactQueryProvider>
              <TooltipProvider>
                {children}
                <ToastProvider />
              </TooltipProvider>
            </ReactQueryProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
