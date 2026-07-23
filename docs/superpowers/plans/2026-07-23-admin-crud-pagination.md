# Admin CRUD Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add shared URL-driven numbered pagination to all eight Admin CRUD indexes and make Projects the Admin entry point.

**Architecture:** Canonicalize every collection endpoint and service on `MetaPagination`, then add one URL-state hook and one shared pagination component. Each CRUD page supplies its current metadata to the shared bounds hook, preserving React Query’s existing mutation/invalidation model.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, TanStack Query 5, Axios, Prisma 7, Tailwind CSS, Lucide React.

## Global Constraints

- Paginate Users, Companies, Skills, Tags, Project Highlights, Experiences, Projects, and Posts.
- Store `page` and `limit` in the URL.
- Default to `page=1&limit=10`.
- Allow only limits `10`, `20`, and `50`.
- Preserve unrelated query parameters.
- Use Previous, Next, numbered pages, ellipses, `Showing x–y of total`, and a per-page selector.
- Use `meta.total` for header counts.
- Keep infinite relation selectors as infinite-scroll controls.
- Redirect `/admin` and default successful login to `/admin/projects`.
- Remove Dashboard from Admin navigation.
- Do not add or run automated tests during the current large refactor.

---

### Task 1: Canonicalize pagination API responses

**Files:**

- Modify: `types/api.d.ts`
- Modify: `app/api/companies/route.ts`
- Modify: `app/api/skills/route.ts`
- Modify: `app/api/tags/route.ts`
- Modify: `app/api/experiences/route.ts`
- Modify: `app/api/projects/route.ts`
- Modify: `app/api/posts/route.ts`
- Review: `app/api/users/route.ts`
- Review: `app/api/project-highlights/route.ts`

**Interfaces:**

- Produces one `MetaPagination` response contract for every CRUD list.
- Removes `LegacyMetaPagination`.

- [ ] **Step 1: Remove the legacy type**

Delete this declaration from `types/api.d.ts`:

```ts
export type LegacyMetaPagination = {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
```

Keep:

```ts
export type MetaPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
```

- [ ] **Step 2: Replace legacy metadata in six APIs**

In Companies, Skills, Tags, Experiences, Projects, and Posts, replace:

```ts
meta: {
  currentPage: page,
  perPage: limit,
  total,
  totalPages,
  hasNextPage: page < totalPages,
  hasPreviousPage: page > 1,
}
```

with:

```ts
meta: {
  page,
  limit,
  total,
  totalPages,
  hasNextPage: page < totalPages,
  hasPrevPage: page > 1,
}
```

Tags currently nests this object in its existing response shape; change
only the field names and keep the surrounding `{ data, meta }` contract.

- [ ] **Step 3: Audit all eight list APIs**

Run:

```bash
rg -n "currentPage|perPage|hasPreviousPage" app/api/{users,companies,skills,tags,project-highlights,experiences,projects,posts}/route.ts
```

Expected: no output.

Run:

```bash
rg -l "hasPrevPage" app/api/{users,companies,skills,tags,project-highlights,experiences,projects,posts}/route.ts | sort
```

Expected: all eight collection route files.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint types/api.d.ts app/api/{users,companies,skills,tags,project-highlights,experiences,projects,posts}/route.ts
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add types/api.d.ts app/api
git commit -m "refactor: standardize crud pagination metadata"
```

---

### Task 2: Canonicalize collection and infinite-query services

**Files:**

- Modify: `lib/services/companies/get-companies.ts`
- Modify: `lib/services/skills/get-skills.ts`
- Modify: `lib/services/tags/get-tags.ts`
- Modify: `lib/services/experiences/get-experiences.ts`
- Modify: `lib/services/projects/get-projects.ts`
- Modify: `lib/services/posts/get-posts.ts`
- Review: `lib/services/users/get-users.ts`
- Review: `lib/services/project-highlights/get-project-highlights.ts`
- Modify: `lib/services/companies/get-infinite-companies.ts`
- Modify: `lib/services/skills/get-infinite-skills.ts`
- Modify: `lib/services/tags/get-infinite-tags.ts`
- Review: `lib/services/project-highlights/get-infinite-project-highlights.ts`

**Interfaces:**

- Consumes `PaginatedResponse<T>` with its default `MetaPagination`.
- Produces collection hooks retaining previous page data.
- Preserves the existing infinite-query `options` output.

- [ ] **Step 1: Remove every legacy type import and generic**

For each collection service, replace:

```ts
import type {
  LegacyMetaPagination,
  PaginatedResponse,
  QueryParams,
} from "@/types/api";
```

with:

```ts
import type {
  PaginatedResponse,
  QueryParams,
} from "@/types/api";
```

Replace:

```ts
PaginatedResponse<Entity, LegacyMetaPagination>
```

with:

```ts
PaginatedResponse<Entity>
```

Users and Project Highlights already use the canonical generic; retain
their existing `placeholderData: keepPreviousData`.

- [ ] **Step 2: Update infinite-query next-page readers**

For Companies, Skills, and Tags, replace:

```ts
getNextPageParam: (lastPage) =>
  lastPage.meta.hasNextPage
    ? lastPage.meta.currentPage + 1
    : undefined,
```

with:

```ts
getNextPageParam: (lastPage) =>
  lastPage.meta.hasNextPage
    ? lastPage.meta.page + 1
    : undefined,
```

Use `PaginatedResponse<Entity>` instead of the legacy generic.
Project Highlights already uses `meta.page`; keep that behavior.

- [ ] **Step 3: Audit service consistency**

Run:

```bash
rg -n "LegacyMetaPagination|currentPage|perPage|hasPreviousPage" lib/services
```

Expected: no output.

Run:

```bash
rg -l "placeholderData: keepPreviousData" \
  lib/services/{users,companies,skills,tags,project-highlights,experiences,projects,posts}/get-*.ts
```

Expected: all eight numbered collection services.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint lib/services
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add lib/services
git commit -m "refactor: align crud pagination services"
```

---

### Task 3: Build shared URL pagination state

**Files:**

- Create: `lib/pagination/admin-pagination.ts`
- Create: `lib/hooks/use-admin-pagination.ts`

**Interfaces:**

- Produces `ADMIN_PAGE_LIMITS`, `DEFAULT_ADMIN_PAGE`,
  `DEFAULT_ADMIN_PAGE_LIMIT`, and `getAdminPageItems`.
- Produces `useAdminPagination()` and
  `useAdminPaginationBounds({ page, meta, replacePage })`.

- [ ] **Step 1: Add pagination constants and page-window logic**

Create `lib/pagination/admin-pagination.ts`:

```ts
export const ADMIN_PAGE_LIMITS = [10, 20, 50] as const;
export const DEFAULT_ADMIN_PAGE = 1;
export const DEFAULT_ADMIN_PAGE_LIMIT = 10;

export type AdminPageItem =
  | number
  | "ellipsis-left"
  | "ellipsis-right";

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

  const visible = new Set([
    1,
    totalPages,
    page - 1,
    page,
    page + 1,
  ]);
  const pages = [...visible]
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
```

- [ ] **Step 2: Implement strict URL parsing**

Create `lib/hooks/use-admin-pagination.ts` as a Client hook. Parse only
base-10 integer strings:

```ts
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
```

- [ ] **Step 3: Implement URL navigation and normalization**

`useAdminPagination()` must use `usePathname`, `useRouter`,
`useSearchParams`, and `useTransition`.

Return:

```ts
{
  page,
  limit,
  isNavigating,
  setPage(page: number): void,
  setLimit(limit: number): void,
  replacePage(page: number): void,
}
```

Create every new URL from:

```ts
const parameters = new URLSearchParams(searchParams.toString());
```

so unrelated query parameters survive. `setPage` and `setLimit` call
`router.push`; `replacePage` and invalid/default normalization call
`router.replace`. Pass `{ scroll: false }`.

The normalization effect must write both canonical values when either raw
parameter differs:

```ts
if (
  searchParams.get("page") !== String(page) ||
  searchParams.get("limit") !== String(limit)
) {
  replaceUrl({ page, limit });
}
```

`setLimit` always writes `page=1`.

- [ ] **Step 4: Implement response-bound normalization**

Export:

```ts
type PaginationBoundsInput = {
  page: number;
  meta?: MetaPagination;
  replacePage: (page: number) => void;
};
```

`useAdminPaginationBounds` uses an effect:

```ts
const lastPage = Math.max(1, meta?.totalPages ?? 1);

if (meta && page > lastPage) {
  replacePage(lastPage);
}
```

This handles an out-of-range URL and delete fallback. Do nothing while
metadata is unavailable.

- [ ] **Step 5: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint lib/pagination/admin-pagination.ts lib/hooks/use-admin-pagination.ts
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add lib/pagination lib/hooks/use-admin-pagination.ts
git commit -m "feat: add admin pagination state"
```

---

### Task 4: Build the shared pagination UI

**Files:**

- Create: `components/admin/admin-pagination.tsx`
- Modify: `components/layout/crud-layout.tsx`

**Interfaces:**

- Consumes `MetaPagination`, `ADMIN_PAGE_LIMITS`, and
  `getAdminPageItems`.
- Produces `AdminPagination`.
- Adds optional `total` to `CrudLayout`.

- [ ] **Step 1: Implement `AdminPagination`**

Create a Client component with:

```ts
type Props = {
  meta: MetaPagination;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};
```

Return `null` when `meta.total === 0`. Compute:

```ts
const start = (meta.page - 1) * meta.limit + 1;
const end = Math.min(meta.page * meta.limit, meta.total);
const pageItems = getAdminPageItems(
  meta.page,
  meta.totalPages,
);
```

Render:

- `Showing {start}–{end} of {meta.total}`;
- a native `<select>` labeled `Per page` using values `10`, `20`, `50`;
- Previous and Next Buttons controlled by `hasPrevPage` and
  `hasNextPage`;
- numbered Buttons;
- non-interactive `…` spans for ellipses.

Use `aria-current="page"` on the active numbered Button and
`variant="primary"` for active state. All other controls use existing
Button variants and square border styling. Disable every control when
`disabled` is true.

- [ ] **Step 2: Make `CrudLayout` total-aware**

Extend its props:

```ts
type Props<Data> = {
  kind: SimpleEntityKind;
  data?: Data[];
  total?: number;
  children: React.ReactNode;
  onCreate?: () => void;
  createLabel?: string;
};
```

Pass this header count:

```tsx
count={total ?? data.length}
```

- [ ] **Step 3: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint components/admin/admin-pagination.tsx components/layout/crud-layout.tsx
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add components/admin/admin-pagination.tsx components/layout/crud-layout.tsx
git commit -m "feat: add admin pagination controls"
```

---

### Task 5: Paginate the five simple CRUD indexes

**Files:**

- Modify: `app/admin/users/users-client-page.tsx`
- Modify: `app/admin/companies/company-client-page.tsx`
- Modify: `app/admin/skills/skill-client-page.tsx`
- Modify: `app/admin/tags/tags-client-page.tsx`
- Modify: `app/admin/project-highlights/project-highlights-client-page.tsx`

**Interfaces:**

- Consumes `useAdminPagination`,
  `useAdminPaginationBounds`, and `AdminPagination`.
- Passes `{ page, limit }` to the existing entity query.

- [ ] **Step 1: Add the shared pagination pattern to each page**

For each client page, import:

```ts
import { AdminPagination } from "@/components/admin/admin-pagination";
import {
  useAdminPagination,
  useAdminPaginationBounds,
} from "@/lib/hooks/use-admin-pagination";
```

Before its collection hook, add:

```ts
const pagination = useAdminPagination();
```

Change each query call using this mapping:

```ts
useGetUsers({
  page: pagination.page,
  limit: pagination.limit,
});

useGetCompanies({
  page: pagination.page,
  limit: pagination.limit,
});

useGetSkills({
  page: pagination.page,
  limit: pagination.limit,
});

useGetTags({
  page: pagination.page,
  limit: pagination.limit,
});

useGetProjectHighlights({
  page: pagination.page,
  limit: pagination.limit,
});
```

Destructure `isFetching` from every query result.

- [ ] **Step 2: Add metadata bounds synchronization**

After each query call:

```ts
useAdminPaginationBounds({
  page: pagination.page,
  meta: response?.meta,
  replacePage: pagination.replacePage,
});
```

Use each page’s existing response variable in place of `response`.

- [ ] **Step 3: Show full totals in headers**

Add this prop to every `CrudLayout`:

```tsx
total={response?.meta.total}
```

Keep its existing `data`, `kind`, and creation props.

- [ ] **Step 4: Render pagination after content**

When metadata exists and the request is not an initial load, render:

```tsx
<AdminPagination
  meta={response.meta}
  disabled={pagination.isNavigating || isFetching}
  onPageChange={pagination.setPage}
  onLimitChange={pagination.setLimit}
/>
```

Place it after the cards and before modal/confirmation-dialog markup so
pagination remains outside dialog content.

- [ ] **Step 5: Audit all five pages**

Run:

```bash
for file in \
  app/admin/users/users-client-page.tsx \
  app/admin/companies/company-client-page.tsx \
  app/admin/skills/skill-client-page.tsx \
  app/admin/tags/tags-client-page.tsx \
  app/admin/project-highlights/project-highlights-client-page.tsx
do
  rg -q "AdminPagination" "$file" || echo "MISSING UI $file"
  rg -q "useAdminPaginationBounds" "$file" || echo "MISSING BOUNDS $file"
done
```

Expected: no `MISSING` output.

- [ ] **Step 6: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint \
  app/admin/users/users-client-page.tsx \
  app/admin/companies/company-client-page.tsx \
  app/admin/skills/skill-client-page.tsx \
  app/admin/tags/tags-client-page.tsx \
  app/admin/project-highlights/project-highlights-client-page.tsx
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add app/admin/{users,companies,skills,tags,project-highlights}
git commit -m "feat: paginate simple admin crud indexes"
```

---

### Task 6: Paginate Experiences, Projects, and Posts

**Files:**

- Modify: `app/admin/experiences/experiences-client-page.tsx`
- Modify: `app/admin/projects/projects-client-page.tsx`
- Modify: `app/admin/posts/posts-client-page.tsx`

**Interfaces:**

- Uses the same shared hook/component contract as Task 5.
- Removes all `limit: 100` collection requests.

- [ ] **Step 1: Replace fixed-limit queries**

In all three pages:

```ts
const pagination = useAdminPagination();
```

Replace their query calls:

```ts
useGetExperiences({
  page: pagination.page,
  limit: pagination.limit,
});

useGetProjects({
  page: pagination.page,
  limit: pagination.limit,
});

useGetPosts({
  page: pagination.page,
  limit: pagination.limit,
});
```

Destructure `isFetching` and call:

```ts
useAdminPaginationBounds({
  page: pagination.page,
  meta: data?.meta,
  replacePage: pagination.replacePage,
});
```

- [ ] **Step 2: Use full totals and render controls**

Replace:

```tsx
count={items.length}
```

with:

```tsx
count={data?.meta.total ?? 0}
```

After the non-empty one-column card grid, render:

```tsx
{data?.meta && (
  <AdminPagination
    meta={data.meta}
    disabled={pagination.isNavigating || isFetching}
    onPageChange={pagination.setPage}
    onLimitChange={pagination.setLimit}
  />
)}
```

`AdminPagination` returns `null` for empty datasets, so the existing empty
content remains authoritative.

- [ ] **Step 3: Audit fixed-limit removal**

Run:

```bash
rg -n "limit:\\s*100" \
  app/admin/{experiences,projects,posts}/*-client-page.tsx
```

Expected: no output.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint \
  app/admin/experiences/experiences-client-page.tsx \
  app/admin/projects/projects-client-page.tsx \
  app/admin/posts/posts-client-page.tsx
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add app/admin/{experiences,projects,posts}
git commit -m "feat: paginate content admin indexes"
```

---

### Task 7: Make Projects the Admin entry point

**Files:**

- Modify: `app/admin/page.tsx`
- Modify: `lib/constants/admin-navigation.ts`
- Modify: `lib/auth/request.ts`

**Interfaces:**

- `/admin` redirects to `/admin/projects`.
- Login without a safe `next` returns `/admin/projects`.
- Sidebar starts with Projects and contains no Dashboard.

- [ ] **Step 1: Redirect the Admin root**

Replace `app/admin/page.tsx` with:

```tsx
import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/projects");
}
```

- [ ] **Step 2: Remove Dashboard navigation**

Remove `LayoutDashboard` from the Lucide import and delete:

```ts
{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
```

Keep Projects as the first `adminNavItems` entry.

- [ ] **Step 3: Change the safe default destination**

In `lib/auth/request.ts`, define:

```ts
const DEFAULT_ADMIN_REDIRECT = "/admin/projects";
```

Replace every fallback `return "/admin"` in
`getSafeRedirectPath` with:

```ts
return DEFAULT_ADMIN_REDIRECT;
```

Do not alter handling for valid same-origin paths.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint app/admin/page.tsx lib/constants/admin-navigation.ts lib/auth/request.ts
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add app/admin/page.tsx lib/constants/admin-navigation.ts lib/auth/request.ts
git commit -m "refactor: make projects the admin entry point"
```

---

### Task 8: Full verification and audit

**Files:**

- Review: all files changed in Tasks 1–7.

**Interfaces:**

- Confirms all approved pagination and redirect behavior is present.

- [ ] **Step 1: Audit CRUD UI coverage**

Run:

```bash
for file in \
  app/admin/users/users-client-page.tsx \
  app/admin/companies/company-client-page.tsx \
  app/admin/skills/skill-client-page.tsx \
  app/admin/tags/tags-client-page.tsx \
  app/admin/project-highlights/project-highlights-client-page.tsx \
  app/admin/experiences/experiences-client-page.tsx \
  app/admin/projects/projects-client-page.tsx \
  app/admin/posts/posts-client-page.tsx
do
  rg -q "AdminPagination" "$file" || echo "MISSING UI $file"
  rg -q "useAdminPaginationBounds" "$file" || echo "MISSING BOUNDS $file"
done
```

Expected: no output.

- [ ] **Step 2: Audit canonical metadata**

Run:

```bash
rg -n "LegacyMetaPagination|currentPage|perPage|hasPreviousPage" \
  types app/api lib/services
```

Expected: no output.

- [ ] **Step 3: Run static and production verification**

Run:

```bash
npx prisma validate
npx tsc --noEmit --incremental false
npm run lint
npm run build
git diff --check
```

Expected: all commands exit `0`. Existing `metadataBase` warnings are
allowed; no new errors are accepted.

- [ ] **Step 4: Run manual browser smoke checks**

With the development server running, verify:

1. `/admin` redirects to `/admin/projects?page=1&limit=10`;
2. unauthenticated Admin redirects still preserve `next`;
3. successful login without `next` lands on Projects;
4. all eight CRUD indexes normalize missing/invalid query values;
5. page and limit changes update the URL and browser history;
6. controls show Previous, Next, ellipses, limits, and range text;
7. delete fallback returns an empty final page to the last valid page;
8. Company, Skill, Tag, and Project Highlight relation selects still
   load subsequent pages.

- [ ] **Step 5: Inspect final repository state**

Run:

```bash
git status --short
git log -8 --oneline
```

Expected: clean worktree and Task 1–7 commits visible.
