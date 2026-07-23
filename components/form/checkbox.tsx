import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id: string;
  label: string;
  description?: string;
  errorMessage?: string;
};

export function Checkbox({ id, label, description, errorMessage, className, ...props }: Props) {
  return (
    <div className={className}>
      <label htmlFor={id} className={cn("flex cursor-pointer items-start gap-3", props.disabled && "cursor-not-allowed opacity-50")}>
        <input id={id} type="checkbox" className="peer sr-only" {...props} />
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-border text-transparent transition-colors",
            "peer-checked:border-fg peer-checked:bg-fg peer-checked:text-bg",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-fg peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg",
            errorMessage && "border-red-500",
          )}
        >
          <Check size={13} strokeWidth={3} />
        </span>
        <span>
          <span className="block font-mono text-xs uppercase tracking-[0.14em]">{label}</span>
          {description && <span className="mt-1 block text-sm leading-relaxed text-muted">{description}</span>}
        </span>
      </label>
      {errorMessage && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
}
