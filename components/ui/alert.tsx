import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
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
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-6 min-h-6 w-6 shrink-0 border-0 p-0 text-current hover:bg-transparent"
          onClick={onClose}
          aria-label="Close alert"
        >
          <X size={15} />
        </Button>
      )}
    </div>
  );
}
