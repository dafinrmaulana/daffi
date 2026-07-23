"use client";

import {
  useCallback,
  useEffect,
  useTransition,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  ADMIN_PAGE_LIMITS,
  DEFAULT_ADMIN_PAGE,
  DEFAULT_ADMIN_PAGE_LIMIT,
} from "@/lib/pagination/admin-pagination";
import type { MetaPagination } from "@/types/api";

function parsePage(value: string | null) {
  if (!value || !/^\d+$/.test(value)) {
    return DEFAULT_ADMIN_PAGE;
  }

  const page = Number(value);

  return Number.isSafeInteger(page) && page >= 1
    ? page
    : DEFAULT_ADMIN_PAGE;
}

function parseLimit(value: string | null) {
  const limit = Number(value);

  return ADMIN_PAGE_LIMITS.includes(
    limit as (typeof ADMIN_PAGE_LIMITS)[number],
  )
    ? limit
    : DEFAULT_ADMIN_PAGE_LIMIT;
}

export function useAdminPagination() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const page = parsePage(searchParams.get("page"));
  const limit = parseLimit(searchParams.get("limit"));

  const createUrl = useCallback(
    (nextPage: number, nextLimit: number) => {
      const parameters = new URLSearchParams(
        searchParams.toString(),
      );
      parameters.set("page", String(nextPage));
      parameters.set("limit", String(nextLimit));

      return `${pathname}?${parameters.toString()}`;
    },
    [pathname, searchParams],
  );

  const navigate = useCallback(
    (
      nextPage: number,
      nextLimit: number,
      mode: "push" | "replace",
    ) => {
      const url = createUrl(nextPage, nextLimit);

      startTransition(() => {
        router[mode](url, { scroll: false });
      });
    },
    [createUrl, router],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      if (
        !Number.isSafeInteger(nextPage) ||
        nextPage < 1 ||
        nextPage === page
      ) {
        return;
      }

      navigate(nextPage, limit, "push");
    },
    [limit, navigate, page],
  );

  const setLimit = useCallback(
    (nextLimit: number) => {
      if (
        !ADMIN_PAGE_LIMITS.includes(
          nextLimit as (typeof ADMIN_PAGE_LIMITS)[number],
        )
      ) {
        return;
      }

      navigate(DEFAULT_ADMIN_PAGE, nextLimit, "push");
    },
    [navigate],
  );

  const replacePage = useCallback(
    (nextPage: number) => {
      const normalizedPage =
        Number.isSafeInteger(nextPage) && nextPage >= 1
          ? nextPage
          : DEFAULT_ADMIN_PAGE;

      if (normalizedPage === page) {
        return;
      }

      navigate(normalizedPage, limit, "replace");
    },
    [limit, navigate, page],
  );

  useEffect(() => {
    if (
      searchParams.get("page") !== String(page) ||
      searchParams.get("limit") !== String(limit)
    ) {
      navigate(page, limit, "replace");
    }
  }, [limit, navigate, page, searchParams]);

  return {
    page,
    limit,
    isNavigating,
    setPage,
    setLimit,
    replacePage,
  };
}

type PaginationBoundsInput = {
  page: number;
  limit: number;
  meta?: MetaPagination;
  replacePage: (page: number) => void;
};

export function useAdminPaginationBounds({
  page,
  limit,
  meta,
  replacePage,
}: PaginationBoundsInput) {
  useEffect(() => {
    if (
      !meta ||
      meta.page !== page ||
      meta.limit !== limit
    ) {
      return;
    }

    const lastPage = Math.max(1, meta.totalPages);

    if (page > lastPage) {
      replacePage(lastPage);
    }
  }, [limit, meta, page, replacePage]);
}
