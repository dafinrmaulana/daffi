import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

export function Button({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 border border-fg px-4 py-3 text-sm font-medium transition-colors hover:bg-fg hover:text-bg focus:outline-none focus:ring-2 focus:ring-fg focus:ring-offset-2 focus:ring-offset-bg",
        className,
      )}
    >
      {children}
      <ArrowUpRight aria-hidden="true" size={16} />
    </Link>
  )
}
