import { cn } from "@/lib/utils"

export function Section({
  id,
  children,
  className,
}: {
  id?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn("mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 lg:py-20", className)}>
      {children}
    </section>
  )
}
