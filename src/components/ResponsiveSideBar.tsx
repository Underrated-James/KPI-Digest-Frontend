"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, ChevronRight } from "lucide-react";

const navItems = [
  { name: "Projects", href: "/projects" },
  { name: "Sprints", href: "/sprints" },
  { name: "Teams", href: "/teams" },
  { name: "Tickets", href: "/tickets" },
  { name: "Users", href: "/users" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* --- MOBILE HEADER (Visible only on small screens) --- */}
      <header className="lg:hidden flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2 text-sky-400 font-bold">
          <LayoutDashboard size={24} />
          <span className="text-lg">KPI Digest</span>
        </div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* --- MOBILE OVERLAY (Darkens the background when menu is open) --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- ACTUAL SIDEBAR (Hidden left on mobile, Fixed left on desktop) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900 text-zinc-100 flex flex-col border-r border-zinc-800 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen lg:inset-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Sidebar Header / Logo (Visible on Desktop) */}
        <div className="hidden lg:flex p-8 items-center gap-3 text-2xl font-bold tracking-tight text-sky-400">
          <LayoutDashboard size={32} />
          <span>KPI Digest</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1 mt-4 lg:mt-0">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? "bg-sky-500/10 text-sky-400 font-semibold" 
                    : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.name}
                </span>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-6 border-t border-zinc-800">
          <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-zinc-500 hover:text-red-400 transition-colors">
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}