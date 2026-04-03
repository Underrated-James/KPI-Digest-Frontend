import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { ReduxProvider } from "@/lib/redux-provider";
import { ToastProvider } from "@/lib/toast-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.className} ${geistSans.variable} ${geistMono.variable} ${nevera.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          <ReactQueryProvider>
            <TooltipProvider>
              {children}
              <ToastProvider />
            </TooltipProvider>
          </ReactQueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
