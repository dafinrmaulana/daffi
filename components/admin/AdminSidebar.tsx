import Link from "next/link"
import { ArrowUpRight, X } from "lucide-react"

import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { adminNavItems, isAdminNavItemActive } from "@/lib/constants/admin-navigation"
import { cn } from "@/lib/utils"

export function AdminSidebar({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate: () => void
}) {
  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex h-16 items-center justify-between border-b border-border px-5">
        <span className="font-mono text-xs uppercase tracking-[0.16em]">Admin Workspace</span>
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={onNavigate}
          className="inline-flex h-9 w-9 items-center justify-center border border-border lg:hidden"
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto py-4">
        {adminNavItems.map((item) => {
          const Icon = item.icon
          const active = isAdminNavItemActive(item, pathname)

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "mx-3 flex items-center gap-3 border px-3 py-3 text-sm transition-colors",
                active
                  ? "border-fg bg-fg text-bg"
                  : "border-transparent text-muted hover:border-border hover:text-fg",
              )}
            >
              <Icon size={17} aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Theme</span>
          <ThemeToggle />
        </div>
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center justify-between border border-border px-3 py-3 text-sm text-muted transition-colors hover:border-fg hover:text-fg"
        >
          Back to portfolio
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
