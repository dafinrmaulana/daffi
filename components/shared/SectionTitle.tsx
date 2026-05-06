export function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return (
    <div className="mb-8 grid gap-3 border-t border-border pt-5 md:grid-cols-[160px_1fr]">
      <p className="font-mono text-xs uppercase text-muted">{eyebrow}</p>
      <h2 className="max-w-3xl font-serif text-3xl leading-tight text-balance sm:text-5xl">
        {title}
      </h2>
    </div>
  )
}
