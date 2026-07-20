export function AdminPageHeader({
  eyebrow,
  title,
  count,
  action,
}: {
  eyebrow: string
  title: string
  count?: number
  action?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <h1 className="font-serif text-5xl leading-none sm:text-6xl">{title}</h1>
          {typeof count === "number" && (
            <span className="pb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {count} records
            </span>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}
