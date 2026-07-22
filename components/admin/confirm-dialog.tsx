"use client";

import { Modal } from "@/components/admin/modal";
import { Button } from "../ui/button";

type Props = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  confirmText?: string;
};

export function ConfirmDialog({
  open,
  title,
  description,
  onClose,
  onConfirm,
  loading,
  confirmText = "Confirm",
}: Props) {
  return (
    <Modal
      open={open}
      title={title}
      onOpenChange={onClose}
      disabled={loading}
      footer={
        <>
          <Button type="button" onClick={onClose} disabled={loading} size="sm">
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={onConfirm} loading={loading} size="sm">
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted">{description}</p>
    </Modal>
  );
}
