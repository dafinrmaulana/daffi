export const ADMIN_PAGE_LIMITS = [10, 20, 50] as const;
export const DEFAULT_ADMIN_PAGE = 1;
export const DEFAULT_ADMIN_PAGE_LIMIT = 10;

export type AdminPageItem =
  | number
  | "ellipsis-left"
  | "ellipsis-right";

export function getAdminPaginationUrl(
  pathname: string,
  page: number,
  limit: number,
) {
  const parameters = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return `${pathname}?${parameters.toString()}`;
}

export function getAdminPageItems(
  page: number,
  totalPages: number,
): AdminPageItem[] {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }

  const visiblePages = new Set([
    1,
    totalPages,
    page - 1,
    page,
    page + 1,
  ]);
  const pages = [...visiblePages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((left, right) => left - right);
  const items: AdminPageItem[] = [];

  pages.forEach((value, index) => {
    const previous = pages[index - 1];

    if (previous && value - previous > 1) {
      items.push(
        previous === 1 ? "ellipsis-left" : "ellipsis-right",
      );
    }

    items.push(value);
  });

  return items;
}
