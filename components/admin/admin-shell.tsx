"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminPageLabel } from "@/lib/constants/admin-navigation";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/lib/providers/query-providers";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border lg:block">
        <AdminSidebar pathname={pathname} onNavigate={() => setIsOpen(false)} />
      </aside>

      <button
        type="button"
        data-testid="admin-drawer-overlay"
        aria-label="Close admin menu overlay"
        onClick={() => setIsOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        data-testid="admin-mobile-drawer"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[86vw] max-w-72 border-r border-border transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <AdminSidebar pathname={pathname} onNavigate={() => setIsOpen(false)} />
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-bg/95 px-5 backdrop-blur sm:px-8">
          <button
            type="button"
            aria-label="Open admin menu"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center border border-border lg:hidden"
          >
            <Menu size={18} aria-hidden="true" />
          </button>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{getAdminPageLabel(pathname)}</p>
        </header>
        <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <QueryProvider>{children}</QueryProvider>
        </div>
      </div>
    </div>
  );
}
