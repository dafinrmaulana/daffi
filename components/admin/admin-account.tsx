"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/lib/services/auth/logout";
import type { AuthUser } from "@/types/auth";

export function AdminAccount({ user }: { user: AuthUser }) {
  const router = useRouter();
  const logoutMutation = useLogout();
  const [error, setError] = useState("");

  const handleLogout = () => {
    setError("");
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace("/login");
        router.refresh();
      },
      onError: () => {
        setError("Unable to sign out. Please try again.");
      },
    });
  };

  return (
    <div className="space-y-3 border border-border p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate font-mono text-[11px] text-muted">
          @{user.username}
        </p>
      </div>

      {error && (
        <Alert
          className="px-3 py-2 text-xs"
          color="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="w-full justify-between"
        loading={logoutMutation.isPending}
        loadingText="Signing out..."
        onClick={handleLogout}
      >
        Sign out
        <LogOut size={15} aria-hidden="true" />
      </Button>
    </div>
  );
}
