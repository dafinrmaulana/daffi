import { ArrowUpRight } from "lucide-react";
import Link, { type LinkProps } from "next/link";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline";

type CommonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type LinkButtonProps = CommonProps &
  LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    href: LinkProps["href"];
    externalIcon?: boolean;
  };

type RegularButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
    externalIcon?: never;
  };

type ButtonSize = "sm" | "md" | "lg";
type ButtonProps = LinkButtonProps | RegularButtonProps;

const variants: Record<ButtonVariant, string> = {
  primary: "border-fg bg-fg text-bg hover:opacity-85",
  secondary: "border-border bg-transparent text-fg hover:border-fg hover:bg-muted/10",
  outline: "border-fg bg-transparent text-fg hover:bg-fg hover:text-bg",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-14 px-6 text-base",
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export function Button(props: ButtonProps) {
  const { className, variant = "outline", size = "md" } = props;

  const classes = cn(
    "inline-flex items-center justify-center gap-2 border transition-colors",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  if (props.href !== undefined) {
    const { href, externalIcon = true, children, ...linkProps } = props;

    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
        {externalIcon && <ArrowUpRight aria-hidden="true" size={iconSizes[size]} />}
      </Link>
    );
  }

  const { type = "button", children, ...buttonProps } = props;

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
