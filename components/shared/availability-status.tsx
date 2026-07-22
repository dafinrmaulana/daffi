import { cn } from "@/lib/utils";

export function AvailabilityStatus({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center", compact ? "gap-2" : "gap-3")}>
      <span className={cn("relative flex", compact ? "h-2.5 w-2.5" : "h-3 w-3")}>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/60" />
        <span
          className={cn(
            "relative inline-flex rounded-full bg-green-500",
            compact ? "h-2.5 w-2.5" : "h-3 w-3",
          )}
        />
      </span>
      <span className="font-mono text-xs uppercase text-muted">Online</span>
    </div>
  );
}
