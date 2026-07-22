import { cn } from "@/lib/utils"

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-border px-2 py-1 text-xs uppercase tracking-normal text-muted",
        className,
      )}
    >
      {children}
    </span>
  )
}
