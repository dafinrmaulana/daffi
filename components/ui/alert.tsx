import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type AlertColor = "success" | "error" | "warning" | "info";

type Props = {
  message: string;
  color?: AlertColor;
  className?: string;
  onClose?: () => void;
};

const colors: Record<AlertColor, string> = {
  success: "border-green-500 bg-green-950/30 text-green-500",
  error: "border-red-500 bg-red-950/30 text-red-500",
  warning: "border-yellow-500 bg-yellow-950/30 text-yellow-500",
  info: "border-blue-500 bg-blue-950/30 text-blue-500",
};

export default function Alert({ message, color = "success", onClose, className }: Props) {
  if (!message) return null;

  return (
    <div className={cn("relative flex w-full items-center gap-2 border px-4 py-3", colors[color], className)}>
      <p className="flex-1">{message}</p>

      {onClose && (
        <button type="button" className="shrink-0" onClick={onClose} aria-label="Close alert">
          <X size={15} />
        </button>
      )}
    </div>
  );
}
