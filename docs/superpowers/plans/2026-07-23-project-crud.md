# Project CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a slug-based Project CRUD with dedicated admin pages, sanitized Tiptap body HTML, structured JSON metrics, and searchable infinite Company/Tag relation selects.

**Architecture:** Reuse the stable Experience primitives (`RichTextEditor`, `RichTextContent`, and `InfiniteSelect`) while keeping Project schema, form, metrics editor, cards, detail, API, and services domain-specific. Project payloads send relation slugs; API helpers resolve them to internal IDs and Prisma writes scalar fields plus Tag connections atomically.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma 7/PostgreSQL, React Hook Form, Zod 4, TanStack Query 5, Axios, Tiptap 3.28, sanitize-html 2.17, Tailwind CSS 3

## Global Constraints

- Project routes and mutations use `slug`; numeric IDs remain internal to Prisma.
- Create and edit use dedicated pages, never a modal.
- The index uses one full-width card per row.
- Company is required single-select; Tags are optional multi-select.
- Thumbnail remains a URL/path field; do not build upload infrastructure.
- Keep both `metric` headline text and ordered `metrics` label/value JSON entries.
- Body uses the existing Tiptap feature set and server-side HTML allowlist; Excerpt remains plain text.
- Reuse existing Experience primitives and avoid a generic schema-driven CRUD abstraction.
- New reusable exported type declarations live in `.d.ts` modules under `types/`.
- Preserve Post mock configuration and unrelated user changes.
- Do not create or run automated tests during this refactor; verify with Prisma, TypeScript, ESLint, build, API smoke checks, and manual interaction checks.
- Inspect `git status --short` before every commit.

---

## File Map

### Contracts and validation

- Create `types/project.d.ts`: Project DTOs, metric entry, and relation input.
- Create `lib/form/project-schema.ts`: create/update validation, metric normalization, URL/path rules.
- Create `lib/api/project-relations.ts`: Company and Tag slug resolution.
- Create `lib/project.ts`: metrics JSON parsing and Project display helpers.

### API and services

- Create `app/api/projects/route.ts`: paginated/searchable GET and POST.
- Create `app/api/projects/[slug]/route.ts`: detail GET, PATCH, and DELETE.
- Create `lib/services/projects/get-projects.ts`.
- Create `lib/services/projects/get-project.ts`.
- Create `lib/services/projects/create-project.ts`.
- Create `lib/services/projects/update-project.ts`.
- Create `lib/services/projects/delete-project.ts`.
- Create `lib/services/tags/get-infinite-tags.ts`.

### Form primitives and pages

- Create `components/form/checkbox.tsx`.
- Create `components/admin/project-metrics-fields.tsx`.
- Create `components/admin/project-form.tsx`.
- Create `components/admin/project-card.tsx`.
- Create `components/admin/project-detail.tsx`.
- Create `app/admin/projects/page.tsx`.
- Create `app/admin/projects/projects-client-page.tsx`.
- Create `app/admin/projects/create/page.tsx`.
- Create `app/admin/projects/[slug]/page.tsx`.
- Create `app/admin/projects/[slug]/project-detail-client.tsx`.
- Create `app/admin/projects/[slug]/edit/page.tsx`.
- Create `app/admin/projects/[slug]/edit/edit-project-client.tsx`.
- Modify `lib/constants/complex-entities.ts` and `types/admin.d.ts`: remove only the Project mock surface.

---

### Task 1: Define Project Contracts, Schema, Relations, and Helpers

**Files:**
- Create: `types/project.d.ts`
- Create: `lib/form/project-schema.ts`
- Create: `lib/api/project-relations.ts`
- Create: `lib/project.ts`

**Interfaces:**
- Produces: `ProjectMetric`, `ProjectWithRelations`, `ProjectRelationInput`, `ProjectSchema`, `UpdateProjectSchema`, `resolveProjectRelations`, `parseProjectMetrics`, and Project display helpers.

- [ ] **Step 1: Add Project `.d.ts` contracts**

Create:

```ts
import type { Company, Project, Tag } from "@/prisma/generated/prisma/client";

export type ProjectMetric = {
  label: string;
  value: string;
};

export type ProjectWithRelations = Omit<Project, "metrics"> & {
  metrics: ProjectMetric[];
  company: Company;
  tags: Tag[];
};

export type ProjectRelationInput = {
  companySlug: string;
  tagSlugs: string[];
};
```

Do not redeclare `RelationOption`; infinite hooks continue importing it from `types/experience.d.ts` until relation-select contracts are moved in a separately approved refactor.

- [ ] **Step 2: Define metric normalization and validation**

In `lib/form/project-schema.ts`, define raw metric rows as `{ label: string; value: string }`. Filter rows only when both trimmed values are blank, then pipe into a completed-row schema requiring both values with 100-character Label and 255-character Value limits. Add a case-insensitive duplicate-label issue at the duplicate row's `label` path.

Use this structure so `z.input` remains compatible with React Hook Form:

```ts
const rawMetricsSchema = z
  .array(z.object({ label: z.string(), value: z.string() }))
  .transform((rows) => rows.filter((row) => row.label.trim() || row.value.trim()))
  .pipe(
    z.array(
      z.object({
        label: z.string().trim().min(1, "The metric label is required.").max(100),
        value: z.string().trim().min(1, "The metric value is required.").max(255),
      }),
    ),
  )
  .superRefine((rows, context) => {
    const seen = new Set<string>();
    rows.forEach((row, index) => {
      const normalized = row.label.toLowerCase();
      if (seen.has(normalized)) {
        context.addIssue({
          code: "custom",
          path: [index, "label"],
          message: "Metric labels must be unique.",
        });
      }
      seen.add(normalized);
    });
  });
```

- [ ] **Step 3: Define Project create/update schemas**

Create a base `projectFieldsSchema` with:

```ts
{
  title: required trimmed string, max 255;
  slug: slugInputSchema;
  companySlug: required trimmed string;
  role: required trimmed string, max 255;
  year: integer from 1900 through new Date().getFullYear() + 1;
  demoUrl: optional blank-to-null http/https URL, max 2048;
  thumbnail: required string, max 2048, beginning with "/", "http://", or "https://";
  metric: optional blank-to-null string, max 255;
  excerpt: required trimmed string, max 500;
  featured: boolean default false;
  tagSlugs: unique array of non-empty strings;
  metrics: rawMetricsSchema;
  body: required trimmed string, max 250000;
}
```

Export `projectSchema`, `updateProjectSchema = projectFieldsSchema.partial().refine(nonEmptyPayload)`, `ProjectSchema = z.input<typeof projectSchema>`, `ParsedProjectSchema = z.output<typeof projectSchema>`, and `UpdateProjectSchema = z.input<typeof updateProjectSchema>`.

- [ ] **Step 4: Resolve Company and Tags**

`resolveProjectRelations(input)` queries required Company and all unique Tags in parallel. Return:

```ts
type ResolvedProjectRelations = {
  companyId: number;
  companyName: string;
  tagIds: number[];
};
```

Add `ProjectRelationValidationError` and `isProjectRelationValidationError`. Missing Company maps to `companySlug`; any missing Tags are listed in a `tagSlugs` field error.

- [ ] **Step 5: Add JSON and display helpers**

`parseProjectMetrics(value)` accepts Prisma `JsonValue`, returns only array entries containing string `label` and `value`, and trims them. Add `formatProjectYear(year)` returning `String(year)` and `getThumbnailKind(value)` returning `"remote" | "local" | "invalid"` using the same URL/path rules as validation.

- [ ] **Step 6: Verify and commit the data foundation**

Run:

```bash
npx prisma validate
npx tsc --noEmit --incremental false
npx eslint types/project.d.ts lib/form/project-schema.ts lib/api/project-relations.ts lib/project.ts
git diff --check
```

Expected: all commands exit 0.

Commit:

```bash
git add types/project.d.ts lib/form/project-schema.ts lib/api/project-relations.ts lib/project.ts
git diff --cached --check
git commit -m "feat: add project data contracts"
```

---

### Task 2: Implement Project API Routes

**Files:**
- Create: `app/api/projects/route.ts`
- Create: `app/api/projects/[slug]/route.ts`

**Interfaces:**
- Consumes: Project schemas, relation resolver, rich-text sanitizer, metrics parser, Prisma, and `RouteContext`.
- Produces: paginated list and slug-based detail/create/update/delete Project APIs.

- [ ] **Step 1: Define the shared Project include and serializer**

Both route files include Company and Tags ordered by name. Map Prisma results through:

```ts
function serializeProject(project: ProjectWithPrismaRelations): ProjectWithRelations {
  return {
    ...project,
    metrics: parseProjectMetrics(project.metrics),
  };
}
```

Keep this small helper local to each route file rather than adding a cross-route abstraction for two consumers.

- [ ] **Step 2: Implement collection GET**

Parse `page`, `limit`, and `search` using the current CRUD conventions. Search case-insensitively across Title, Role, Excerpt, Company name, and Tag name. Order by `featured desc`, `year desc`, then `createdAt desc`. Return `LegacyMetaPagination` and serialized Projects.

- [ ] **Step 3: Implement POST**

Perform this exact sequence:

1. Parse `projectSchema`.
2. Resolve Company and Tags.
3. Normalize `validated.slug || validated.title`.
4. Return a Slug field error when empty or already used.
5. Sanitize Body with `sanitizeRichText` and reject it if `richTextToPlainText` is empty.
6. Create scalar fields, JSON metrics, Company ID, and nested Tag connections.
7. Return the serialized Project with relations and HTTP 201.

Cast the validated metric array to `Prisma.InputJsonValue` only at the Prisma boundary.

- [ ] **Step 4: Implement detail GET**

Validate the slug parameter, include Company/Tags, return 404 for a missing Project, and otherwise return `ApiResponse<ProjectWithRelations>`.

- [ ] **Step 5: Implement PATCH**

Load the current Project with relations, parse `updateProjectSchema`, construct a complete merged input using current relation slugs and `parseProjectMetrics`, then parse it through `projectSchema`. Resolve the complete relation set, normalize the merged slug, enforce uniqueness excluding the current record, sanitize merged Body, and update scalar fields plus `tags: { set: tagIds }`. Return the serialized updated record.

- [ ] **Step 6: Implement DELETE and error mapping**

Delete by slug. Map Zod and relation validation to 422 field errors, `P2002` to Slug, `P2025` to 404, and unknown errors to a generic 500 response while logging server details.

- [ ] **Step 7: Verify and commit the API**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint app/api/projects
git diff --check
```

Expected: all commands exit 0.

Commit:

```bash
git add app/api/projects
git diff --cached --check
git commit -m "feat: add project API"
```

---

### Task 3: Add Project CRUD and Infinite Tag Services

**Files:**
- Create: `lib/services/projects/get-projects.ts`
- Create: `lib/services/projects/get-project.ts`
- Create: `lib/services/projects/create-project.ts`
- Create: `lib/services/projects/update-project.ts`
- Create: `lib/services/projects/delete-project.ts`
- Create: `lib/services/tags/get-infinite-tags.ts`

**Interfaces:**
- Produces: `useGetProjects`, `useGetProject`, `useCreateProject`, `useUpdateProject`, `useDeleteProject`, and `useGetInfiniteTags`.

- [ ] **Step 1: Add list and detail hooks**

`useGetProjects(params)` returns `PaginatedResponse<ProjectWithRelations, LegacyMetaPagination>` from `/api/projects` with query key `["projects", { page, limit, search }]` and `keepPreviousData`. `useGetProject(slug)` returns `ApiResponse<ProjectWithRelations>` with query key `["projects", slug]` and an encoded URL.

- [ ] **Step 2: Add mutation hooks**

Use these contracts:

```ts
useCreateProject:
  useMutation<ApiResponse<ProjectWithRelations>, AxiosError<ValidationErrorResponse<keyof ProjectSchema>>, ProjectSchema>

useUpdateProject:
  useMutation<ApiResponse<ProjectWithRelations>, AxiosError<ValidationErrorResponse<keyof ProjectSchema>>, MutationVariables<UpdateProjectSchema, "slug">>

useDeleteProject:
  useMutation<DeleteResponse, AxiosError<DeleteErrorResponse>, string>
```

Invalidate `["projects"]` after every mutation. Update also invalidates old and returned slug detail keys.

- [ ] **Step 3: Add infinite Tag options**

Create a private paginated fetcher returning `PaginatedResponse<Tag, LegacyMetaPagination>`. Implement `useGetInfiniteTags(search, limit = 20)` with `initialPageParam: 1`, query key `["tags", "infinite", { search, limit }]`, next page from `currentPage`, and flattened `{ value: tag.slug, label: tag.name }` options.

The current Tags API is already case-insensitive; preserve its response shape and do not modify it.

- [ ] **Step 4: Verify and commit services**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint lib/services/projects lib/services/tags/get-infinite-tags.ts
git diff --check
```

Expected: all commands exit 0.

Commit:

```bash
git add lib/services/projects lib/services/tags/get-infinite-tags.ts
git diff --cached --check
git commit -m "feat: add project data services"
```

---

### Task 4: Build Checkbox and Project Metrics Fields

**Files:**
- Create: `components/form/checkbox.tsx`
- Create: `components/admin/project-metrics-fields.tsx`

**Interfaces:**
- Produces: reusable native `Checkbox` and Project-specific ordered metrics field array.

- [ ] **Step 1: Build the Checkbox primitive**

Expose standard `React.InputHTMLAttributes<HTMLInputElement>` plus `id`, `label`, optional `description`, and `errorMessage`. Use a visually hidden native checkbox, a visible bordered square, and Check icon. Style checked state through `peer-checked:bg-fg peer-checked:text-bg`, focus through `peer-focus-visible:ring-2`, and disabled/error states through existing tokens. Clicking the label must toggle the native input and keyboard Space must work without custom handlers.

- [ ] **Step 2: Define the metrics field-array boundary**

Use:

```ts
type ProjectMetricsFieldsProps = {
  control: Control<ProjectSchema>;
  register: UseFormRegister<ProjectSchema>;
  errors?: FieldErrors<ProjectSchema>["metrics"];
  disabled?: boolean;
};
```

Call `useFieldArray({ control, name: "metrics" })` and render Label/Value Input controls for every field.

- [ ] **Step 3: Add ordered row actions**

Provide Add Metric, Remove, Move Up, and Move Down Buttons. Append `{ label: "", value: "" }`; use `move(index, index - 1)` and `move(index, index + 1)`; disable boundary moves and all actions during submit. When no rows exist, render a bordered optional-metrics empty state.

- [ ] **Step 4: Map nested metric errors**

Read each row's `errors?.[index]?.label?.message` and `.value?.message`. Also render a top-level metrics message when Zod reports duplicate labels without a row mapping.

- [ ] **Step 5: Verify and commit form primitives**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint components/form/checkbox.tsx components/admin/project-metrics-fields.tsx
git diff --check
```

Expected: all commands exit 0.

Commit:

```bash
git add components/form/checkbox.tsx components/admin/project-metrics-fields.tsx
git diff --cached --check
git commit -m "feat: add project form primitives"
```

---

### Task 5: Build the Shared Project Form

**Files:**
- Create: `components/admin/project-form.tsx`

**Interfaces:**
- Consumes: Project schema, Company/Tag infinite hooks, existing inputs/select/editor, Checkbox, metrics fields, and Project DTO.
- Produces: `ProjectForm` shared by create and edit pages.

- [ ] **Step 1: Define props and defaults**

Use:

```ts
type ProjectFormProps = {
  mode: "create" | "edit";
  initialProject?: ProjectWithRelations;
  isSubmitting: boolean;
  submitError?: string;
  onSubmit: (values: ProjectSchema, applyServerErrors: (error: unknown) => void) => void;
  onCancel: () => void;
};
```

Defaults use empty strings, current year, false Featured, empty Tags/Metrics, and existing Project values during edit.

- [ ] **Step 2: Implement automatic editable slug**

Watch Title. Generate `normalizeSlug(title)` until Slug is manually edited. Start the manual-edit ref as true in edit mode. Render Title before Slug.

- [ ] **Step 3: Connect relation selects**

Maintain separate Company and Tag search states. Initialize selected option objects from `initialProject`. Company uses `useGetInfiniteCompanies` and required single `InfiniteSelect`; Tags use `useGetInfiniteTags` and multiple `InfiniteSelect`. Store only slugs in React Hook Form with dirty/validation flags.

- [ ] **Step 4: Render scalar and boolean controls**

Render Role, Year (`valueAsNumber: true`), Demo URL, Thumbnail, Headline Metric, and Excerpt. Use Checkbox with `register("featured")`. Field order must match the design exactly.

- [ ] **Step 5: Add thumbnail preview**

Track preview failure by current Thumbnail value. Render a 16:9 bordered preview using the submitted URL/path and `object-cover`. On load failure, replace it with “Preview unavailable” without clearing the input. Reset the failure state when the watched Thumbnail value changes. Use a deliberately unoptimized native image with an isolated ESLint disable on that line because arbitrary future remote domains cannot be declared in Next Image configuration.

- [ ] **Step 6: Connect Metrics and Body**

Render `ProjectMetricsFields` and a `Controller`-driven `RichTextEditor`. Both span the full desktop grid width. Validate through `projectSchema.safeParse` before invoking the parent mutation callback and map nested Zod issues back to React Hook Form paths.

- [ ] **Step 7: Map server errors and actions**

Define `applyServerErrors` using `AxiosError<ValidationErrorResponse<keyof ProjectSchema>>`. Preserve all form values, show non-field errors in Alert, and render Cancel plus Create Project/Save Changes Buttons with loading labels.

- [ ] **Step 8: Verify and commit ProjectForm**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint components/admin/project-form.tsx
git diff --check
```

Expected: all commands exit 0.

Commit:

```bash
git add components/admin/project-form.tsx
git diff --cached --check
git commit -m "feat: add project form"
```

---

### Task 6: Build Project Index, Create, Detail, and Edit Pages

**Files:**
- Create: `components/admin/project-card.tsx`
- Create: `components/admin/project-detail.tsx`
- Create: `app/admin/projects/page.tsx`
- Create: `app/admin/projects/projects-client-page.tsx`
- Create: `app/admin/projects/create/page.tsx`
- Create: `app/admin/projects/[slug]/page.tsx`
- Create: `app/admin/projects/[slug]/project-detail-client.tsx`
- Create: `app/admin/projects/[slug]/edit/page.tsx`
- Create: `app/admin/projects/[slug]/edit/edit-project-client.tsx`

**Interfaces:**
- Consumes: Project hooks, form, shared admin primitives, renderer, and Project DTO.
- Produces: the complete `/admin/projects` route family.

- [ ] **Step 1: Build the full-width Project card**

Render a responsive horizontal card with 16:9 thumbnail, Company eyebrow, Title, Role, Year, Excerpt, optional headline Metric, Featured Badge, Tag badges, and View/Edit/Delete actions. Use one column at the index level and slug-based links.

- [ ] **Step 2: Build the index client**

Use `useGetProjects({ limit: 100 })`, AdminPageHeader, Create link, full-width skeletons, EmptyContent, failure Alert, and ConfirmDialog deletion. No Modal form state is allowed.

- [ ] **Step 3: Build create page behavior**

The create client calls `useCreateProject`, maps errors through ProjectForm, and navigates to the returned detail slug on success. Cancel returns to the index.

- [ ] **Step 4: Build the Project detail component**

Render Back/Edit/Delete controls, hero thumbnail, Company/Title/Role/Year, Featured and Tags, optional external Demo Button, optional headline Metric, Excerpt, ordered metrics grid, and `RichTextContent` Body. Use safe `target="_blank"` behavior through the existing external Link Button contract.

- [ ] **Step 5: Build detail page behavior**

Load by slug with `useGetProject`, render a matching skeleton, explicit not-found panel on HTTP 404, generic error Alert, delete confirmation, and redirect to index after successful deletion.

- [ ] **Step 6: Build edit page behavior**

Load the current Project, pass it to ProjectForm, update with the current slug, navigate to the returned slug detail on success, and cancel back to current detail.

- [ ] **Step 7: Verify and commit pages**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint app/admin/projects components/admin/project-card.tsx components/admin/project-detail.tsx
git diff --check
```

Expected: all commands exit 0.

Commit:

```bash
git add app/admin/projects components/admin/project-card.tsx components/admin/project-detail.tsx
git diff --cached --check
git commit -m "feat: add project admin pages"
```

---

### Task 7: Remove Project Mock and Run Final Verification

**Files:**
- Modify: `lib/constants/complex-entities.ts`
- Modify: `types/admin.d.ts`

**Interfaces:**
- Produces: no Project mock record/configuration; Post mock remains unchanged.

- [ ] **Step 1: Remove only Project mock data**

Delete the Project entry and the now-unused `companies` option array. Change `ComplexEntityKind` from `"projects" | "posts"` to `"posts"`. Keep the Tags option array because Post still consumes it. Do not modify Post fields or records.

- [ ] **Step 2: Run full static verification**

Run:

```bash
npx prisma format
npx prisma validate
npx prisma generate
npx tsc --noEmit --incremental false
npm run lint
npm run build
git diff --check
```

Expected: every command exits 0 and the build route table contains all Project admin/API routes.

- [ ] **Step 3: Run API and manual interaction checks**

Against a fresh server process, verify:

1. Project list, create page, and relation searches return HTTP 200.
2. Missing Project API slug returns HTTP 404.
3. Invalid Company/Tags, duplicate Slug, invalid Year/URL/path, empty sanitized Body, partial Metrics rows, and duplicate Metrics labels return field errors.
4. Create redirects to detail and stores ordered Metrics plus sanitized Body.
5. Edit can change Slug and replace Tags/Metrics.
6. Delete confirmation works from index and detail.
7. Company/Tag dropdown search, next-page loading, keyboard selection, and Tag removal work.
8. Thumbnail preview handles valid and failed URLs without changing the field.
9. Cards remain one-column/full-width and all pages work responsively in light/dark themes.

Do not seed permanent records only for verification. If the database lacks Company/Tag fixtures, limit smoke checks to non-mutating routes and validation failures, then report that successful create/edit/delete requires user data.

- [ ] **Step 4: Audit final scope and worktree**

Run:

```bash
git status --short
git diff --stat
git diff --check
rg -n "project-1|project-2|Metrics JSON|Project case study" lib/constants types/admin.d.ts
```

Expected: no old Project mock matches, no unintended files, and no whitespace errors.

- [ ] **Step 5: Commit cleanup**

```bash
git add lib/constants/complex-entities.ts types/admin.d.ts
git diff --cached --check
git commit -m "refactor: remove project mock configuration"
```

If final verification required fixes in tracked Project files, stage those exact files in a separate `fix: complete project CRUD` commit and repeat the full verification commands afterward.

---

## Completion Criteria

- Project list/create/detail/edit/delete operate through slug routes.
- Index cards are one-column and full-width.
- Company and Tags use searchable infinite relation selects.
- Body uses the approved Tiptap subset, is sanitized server-side, and renders only on detail.
- Thumbnail remains URL/path with a resilient preview and no upload subsystem.
- Headline Metric and ordered structured Metrics both persist and render.
- Featured uses a reusable landing-styled native Checkbox.
- No Project modal or Project mock record remains; Post mock configuration is unchanged.
- Prisma validation/generation, TypeScript, ESLint, production build, API smoke checks, and applicable manual checks pass.
