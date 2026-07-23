import { cn } from "@/lib/utils";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  errorMessage?: string;
};

export function Textarea({ id, label, errorMessage, className, required, ...props }: Props) {
  return (
    <div>
      <label htmlFor={id} className="font-mono text-xs uppercase tracking-[0.14em]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        required={required}
        className={cn(
          "mt-1 min-h-32 w-full resize-y border border-border bg-bg p-3 outline-none transition-colors placeholder:text-muted focus:border-fg",
          errorMessage && "border-red-500",
          className,
        )}
        {...props}
      />
      {errorMessage && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
}
