export function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return (
    <div className="mb-10 border-t border-border pt-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px w-10 bg-fg" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {eyebrow}
        </p>
      </div>
      <h2 className="max-w-4xl font-serif text-4xl leading-[0.95] text-balance sm:text-6xl">
        {title}
      </h2>
    </div>
  )
}
