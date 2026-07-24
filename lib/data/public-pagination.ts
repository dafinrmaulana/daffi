import type { MetaPagination } from "@/types/api";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function toPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getPublicPagination(searchParams: URLSearchParams) {
  const page = toPositiveInteger(searchParams.get("page"), DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    toPositiveInteger(searchParams.get("limit"), DEFAULT_LIMIT),
  );

  return { page, limit, skip: (page - 1) * limit };
}

export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): MetaPagination {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
