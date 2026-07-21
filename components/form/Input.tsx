import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  errorMessage?: string;
  prefixIcon?: {
    icon: LucideIcon;
    onClick?: () => void;
  };
  suffixIcon?: {
    icon: LucideIcon;
    onClick?: () => void;
  };
};

export default function Input({
  label,
  id,
  placeholder = "",
  type = "text",
  errorMessage,
  suffixIcon: SuffixIcon,
  prefixIcon: PrefixIcon,
  ...props
}: Props) {
  return (
    <div>
      <label htmlFor={id} className="font-mono text-xs uppercase tracking-[0.14em]">
        {label}
        {props.required && <span className="text-red-500 -translate-y-[3px] translate-x-[2px] inline-block">*</span>}
      </label>
      <div
        className={cn(
          "mt-1 flex min-h-5 items-center border border-border bg-bg transition-colors focus-within:border-fg",
          errorMessage && "border-red-500",
        )}
      >
        {PrefixIcon?.icon && (
          <PrefixIcon.icon
            onClick={PrefixIcon.onClick}
            className="ml-4 shrink-0 text-muted"
            size={18}
            aria-hidden="true"
          />
        )}

        <input
          id={id}
          type={type}
          inputMode="email"
          autoComplete="email"
          className="min-w-0 flex-1 bg-transparent p-3 outline-none placeholder:text-muted"
          placeholder={placeholder}
          {...props}
        />

        {SuffixIcon?.icon && (
          <SuffixIcon.icon
            onClick={SuffixIcon.onClick}
            className="ml-4 shrink-0 text-muted"
            size={18}
            aria-hidden="true"
          />
        )}
      </div>

      {errorMessage && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
}
