# Admin CRUD Pagination Design

## Goal

Add consistent URL-driven pagination to every Admin CRUD index and make
Projects the authenticated workspace entry point.

The affected CRUD indexes are:

- Users;
- Companies;
- Skills;
- Tags;
- Project Highlights;
- Experiences;
- Projects;
- Posts.

## Entry Point and Navigation

The Admin Dashboard is removed from the sidebar navigation. Requests to
`/admin` redirect to `/admin/projects`.

Successful login without an explicit safe `next` destination also
redirects to `/admin/projects`. A valid protected `next` value continues
to take precedence, so a User redirected from a specific Admin page
returns to that page after login.

## Canonical Pagination Contract

Every CRUD collection API returns:

```ts
type MetaPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
```

The legacy metadata fields `currentPage`, `perPage`, and
`hasPreviousPage` are removed from CRUD list responses and client
services.

Infinite-scroll relation selectors for Companies, Skills, Tags, and
Project Highlights continue using their existing endpoints. Their
pagination readers are migrated to the canonical fields without changing
the selector UX.

## URL State

Every Admin CRUD index stores pagination in the URL:

```text
?page=1&limit=10
```

The allowed limits are `10`, `20`, and `50`; the default is `10`.

Opening a CRUD index without pagination parameters normalizes the URL to
`page=1&limit=10`. Invalid, fractional, negative, non-numeric, or
unsupported values normalize to the defaults. Normalization uses URL
replacement so invalid entries do not pollute browser history.

Explicit page and limit changes use navigable URL updates so browser
Back and Forward restore previous pagination state. Changing the limit
always resets the page to `1`.

Pagination updates preserve unrelated query parameters for future
search/filter compatibility.

## Shared Client Architecture

A shared pagination hook owns:

- parsing `page` and `limit` from `useSearchParams`;
- normalization;
- URL updates through the Next.js router;
- preservation of unrelated query parameters;
- fallback to the last valid page when the requested page exceeds the
  response metadata;
- fallback after deletion empties the final page.

A shared `AdminPagination` component renders:

- Previous and Next controls;
- numbered page controls;
- ellipses for large page ranges;
- an accessible per-page selector with `10`, `20`, and `50`;
- `Showing x–y of total`.

For example, a large page range can render:

```text
1 … 4 5 6 … 20
```

The active page uses `aria-current="page"`. Icon or text controls expose
clear `aria-label` values. Pagination controls are disabled while the
next page is being fetched to prevent duplicate navigation.

The component follows the existing monochrome landing/Admin visual
language: square borders, monospace utility labels, foreground/background
inversion for the active page, and existing Button/Input conventions.

## CRUD Integration

Each CRUD client page:

1. reads `page` and `limit` from the shared hook;
2. passes them to its existing React Query collection service;
3. renders only the returned page;
4. passes `meta.total` to the page header;
5. renders `AdminPagination` after non-empty content.

Experiences, Projects, and Posts stop requesting `limit: 100`.

All collection services use the canonical `MetaPagination` type and keep
the previous page data while a new page loads. Existing create, update,
and delete mutations continue invalidating their collection query keys.

Create and edit operations keep the currently selected page. When a
delete causes the current page to exceed the new `totalPages`, the shared
hook navigates to the final valid page. An empty dataset always resolves
to page `1` and hides pagination.

The header record count represents the full collection total, not the
number of records on the current page.

## Page Number Window

The shared component always includes the first and last page. It includes
the active page and one adjacent page on each side, inserting an ellipsis
where at least one page number is omitted.

Small ranges render every page without ellipses.

## Loading and Error Behavior

React Query retains the previous page while the next page request is
pending to prevent content layout flashes. Existing initial skeletons
remain in place.

When an API request fails, the existing CRUD error behavior remains.
Pagination does not navigate in response to failed metadata.

Out-of-range normalization only occurs after valid response metadata is
available.

## Scope

This feature does not add search, filtering, sorting, cursor pagination,
public-page pagination, or pagination to detail/form pages.

Infinite relation selectors remain infinite-scroll controls rather than
switching to numbered pagination.

## Verification

No automated tests are added or run during the current large refactor.

Verification includes:

- auditing all eight CRUD indexes for shared-hook/component usage;
- auditing all collection and infinite-scroll services for canonical
  metadata;
- TypeScript compilation;
- ESLint;
- Prisma schema validation;
- production build;
- `git diff --check`;
- manual smoke checks for default URL normalization, page navigation,
  browser history, `10/20/50` limits, invalid URL values, out-of-range
  pages, delete fallback, Admin/ login redirects, and relation-selector
  infinite scroll.
