import type { MetaPagination } from "@/types/api";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const MAX_PAGE = 1_000_000;

function toPage(value: string | null) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= MAX_PAGE
    ? parsed
    : DEFAULT_PAGE;
}

function toLimit(value: string | null) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0
    ? Math.min(parsed, MAX_LIMIT)
    : DEFAULT_LIMIT;
}

export function getPublicPagination(searchParams: URLSearchParams) {
  const page = toPage(searchParams.get("page"));
  const limit = toLimit(searchParams.get("limit"));

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
