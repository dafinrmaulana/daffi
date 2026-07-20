"use client"

import { Modal } from "@/components/admin/Modal"

export function ConfirmDialog({
  open,
  title,
  description,
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="border border-border px-4 py-3 text-sm">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="border border-fg bg-fg px-4 py-3 text-sm text-bg">
            Delete
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted">
        This action only changes the current UI state during the admin prototype phase.
      </p>
    </Modal>
  )
}
