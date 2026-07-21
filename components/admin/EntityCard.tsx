export type EntityCardMeta = {
  label: string;
  value: React.ReactNode;
};

export function EntityCard({
  eyebrow,
  title,
  description,
  meta = [],
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: EntityCardMeta[];
  actions?: React.ReactNode;
}) {
  return (
    <article className="flex min-h-64 flex-col border border-border bg-bg p-5">
      {eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{eyebrow}</p>}
      <h2 className="mt-4 font-serif text-3xl leading-tight">{title}</h2>
      {description && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{description}</p>}
      {meta.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
          {meta.map((item) => (
            <div key={item.label}>
              <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{item.label}</dt>
              <dd className="mt-1 text-sm truncate">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {actions && <div className="mt-auto flex gap-2 border-t border-border pt-4">{actions}</div>}
    </article>
  );
}
