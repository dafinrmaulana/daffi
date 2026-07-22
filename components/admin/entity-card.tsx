export type EntityCardMeta = {
  label: string;
  value: React.ReactNode;
};
type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: EntityCardMeta[];
  actions?: React.ReactNode;
  loading?: boolean;
};

export function EntityCard({ eyebrow, title, description, meta = [], actions, loading = false }: Props) {
  if (loading) {
    return (
      <article className="flex flex-col border border-border bg-bg p-5 animate-pulse">
        <div className="h-3 w-20 bg-muted" />
        <div className="mt-4 h-8 w-3/4 bg-muted" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full bg-muted" />
          <div className="h-3 w-5/6 bg-muted" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <div className="h-2 w-10 bg-muted" />
              <div className="mt-2 h-4 w-full bg-muted" />
            </div>
          ))}
        </div>
      </article>
    );
  }

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

              <dd className="mt-1 truncate text-sm">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {actions && <div className="mt-auto flex gap-2 border-t border-border pt-4">{actions}</div>}
    </article>
  );
}
