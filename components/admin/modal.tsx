"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
};

export function Modal({
  open,
  title,
  description,
  onOpenChange,
  children,
  footer,
  className,
  size = "sm",
  disabled,
}: Props) {
  const sizeClass = {
    sm: "sm:max-w-xl",
    md: "sm:max-w-2xl",
    lg: "sm:max-w-3xl",
    xl: "sm:max-w-4xl",
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange?.(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6",
        open ? "visible" : "invisible",
      )}
    >
      <button
        type="button"
        data-testid="modal-overlay"
        aria-label="Close dialog overlay"
        disabled={disabled}
        onClick={() => onOpenChange?.(false)}
        className={clsx(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-all",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        className={clsx(
          className,
          sizeClass?.[size],
          "relative z-10 max-h-[92vh] w-full overflow-y-auto border border-border bg-bg transition-all",
          open ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-5",
        )}
      >
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <h2 id="admin-dialog-title" className="font-serif text-3xl">
              {title}
            </h2>
            {description && <p className="mt-2 text-sm text-muted">{description}</p>}
          </div>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label="Close dialog"
            onClick={() => onOpenChange?.(false)}
            disabled={disabled}
            className="shrink-0 hover:bg-transparent"
          >
            <X size={17} aria-hidden="true" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-border p-5">{footer}</div>}
      </section>
    </div>
  );
}
