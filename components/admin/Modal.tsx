"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        data-testid="modal-overlay"
        aria-label="Close dialog overlay"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        className="relative z-10 max-h-[92vh] w-full overflow-y-auto border border-border bg-bg sm:max-w-xl"
      >
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <h2 id="admin-dialog-title" className="font-serif text-3xl">{title}</h2>
            {description && <p className="mt-2 text-sm text-muted">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-border"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-border p-5">{footer}</div>}
      </section>
    </div>
  )
}
