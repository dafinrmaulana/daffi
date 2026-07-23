"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ADMIN_PAGE_LIMITS,
  getAdminPageItems,
} from "@/lib/pagination/admin-pagination";
import type { MetaPagination } from "@/types/api";

type Props = {
  meta: MetaPagination;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export function AdminPagination({
  meta,
  disabled = false,
  onPageChange,
  onLimitChange,
}: Props) {
  if (meta.total === 0) {
    return null;
  }

  const start = (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);
  const pageItems = getAdminPageItems(
    meta.page,
    meta.totalPages,
  );

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-col gap-4 border-t border-border pt-5 lg:flex-row lg:items-center lg:justify-between"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        Showing {start}–{end} of {meta.total}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          Per page
          <select
            value={meta.limit}
            disabled={disabled}
            aria-label="Records per page"
            className="h-9 border border-border bg-bg px-3 text-xs text-fg outline-none transition-colors focus:border-fg disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(event) =>
              onLimitChange(Number(event.target.value))
            }
          >
            {ADMIN_PAGE_LIMITS.map((limit) => (
              <option key={limit} value={limit}>
                {limit}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled || !meta.hasPrevPage}
            aria-label="Go to previous page"
            onClick={() => onPageChange(meta.page - 1)}
          >
            <ChevronLeft size={14} aria-hidden="true" />
            Previous
          </Button>

          {pageItems.map((item) =>
            typeof item === "number" ? (
              <Button
                key={item}
                type="button"
                size="icon"
                variant={
                  item === meta.page ? "primary" : "secondary"
                }
                disabled={disabled}
                aria-label={`Go to page ${item}`}
                aria-current={
                  item === meta.page ? "page" : undefined
                }
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            ) : (
              <span
                key={item}
                aria-hidden="true"
                className="inline-flex h-9 w-9 items-center justify-center font-mono text-xs text-muted"
              >
                …
              </span>
            ),
          )}

          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled || !meta.hasNextPage}
            aria-label="Go to next page"
            onClick={() => onPageChange(meta.page + 1)}
          >
            Next
            <ChevronRight size={14} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
