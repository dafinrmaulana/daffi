import { cn } from "@/lib/utils";

export function PageIntro({
  eyebrow,
  title,
  className,
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px w-12 bg-fg" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
      </div>
      <h1 className="max-w-5xl font-serif text-6xl leading-[0.92] sm:text-8xl">{title}</h1>
    </div>
  );
}
