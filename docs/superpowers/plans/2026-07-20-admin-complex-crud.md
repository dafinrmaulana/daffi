# Admin Complex CRUD UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add UI-only Projects, Posts, and Experiences indexes, slug-based create/edit flows, full-page forms, and unique Project/Experience slug fields in Prisma.

**Architecture:** Typed configuration and fixtures describe each complex model, including scalar and mock-relation fields. A reusable `ComplexIndexPage` renders cards and local delete behavior; a reusable `ComplexEntityForm` renders model-specific full-page React Hook Form controls and returns to the index on submit.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 3, React Hook Form, Prisma 7 schema, Vitest, React Testing Library

## Global Constraints

- Routes use `/create`, never `/new`.
- Edit routes use `[slug]`, never `[id]`.
- Add `slug String @unique` to Project and Experience in `schema.prisma`.
- Do not create or apply a Prisma migration.
- Forms expose every editable schema field except ID and timestamps.
- Form relations use mock selects or checkbox groups.
- Forms have no validation rules and do not persist.
- Submitting returns to the related index.
- Missing fixture slugs render a local not-found state.

---

### Task 1: Prisma Slugs and Typed Complex Configuration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/admin/complex-entities.ts`
- Create: `tests/lib/admin/complex-entities.test.ts`

**Interfaces:**
- Produces: `ComplexEntityKind = "projects" | "posts" | "experiences"`.
- Produces: `ComplexField`, `ComplexRecord`, `ComplexEntityConfig`.
- Produces: `complexEntityConfigs`.

- [ ] Write a failing test that reads `prisma/schema.prisma`, verifies unique slug fields inside Project and Experience, and checks these exact field names:

```ts
projects: slug,title,company,role,year,demoUrl,thumbnail,metric,excerpt,featured,tags,body,metrics
posts: slug,title,date,readTime,thumbnail,excerpt,published,tags,body
experiences: slug,company,role,startDate,endDate,location,description,projectHighlight,skills
```

- [ ] Run `npm test -- tests/lib/admin/complex-entities.test.ts`; expect failure because configuration and two slug fields are missing.

- [ ] Add `slug String @unique` immediately after `id` in Project and Experience.

- [ ] Create `lib/admin/complex-entities.ts` with:

```ts
export type ComplexEntityKind = "projects" | "posts" | "experiences"
export type ComplexFieldType =
  | "text" | "url" | "number" | "date" | "textarea"
  | "checkbox" | "select" | "checkboxGroup"
export type ComplexField = {
  name: string
  label: string
  type: ComplexFieldType
  placeholder?: string
  options?: Array<{ label: string; value: string }>
}
export type ComplexRecord = {
  id: string
  slug: string
  title: string
  description: string
  meta: Array<{ label: string; value: string }>
  values: Record<string, string | boolean | string[]>
}
export type ComplexEntityConfig = {
  title: string
  singular: string
  eyebrow: string
  indexHref: string
  fields: ComplexField[]
  records: ComplexRecord[]
}
```

Use shared relation options:

```ts
companies: northstar, ledgerflow
tags: frontend, product-design
skills: react, typescript
projectHighlights: design-system, platform-migration
```

Add two fixtures per model. Use slugs `northstar-commerce`, `ledgerflow-operations`, `dense-interfaces`, `portfolio-as-product`, `northstar-frontend-developer`, and `ledgerflow-product-engineer`.

- [ ] Run the focused test; expect all configuration and schema assertions to pass.
- [ ] Run `npx prisma format`; expect successful schema formatting without migration files.
- [ ] Commit with `feat: add complex admin fixtures and slugs`.

---

### Task 2: Complex Index and Full-Page Form Components

**Files:**
- Create: `components/admin/complex-index-page.tsx`
- Create: `components/admin/complex-entity-form.tsx`
- Create: `tests/components/admin/complex-crud.test.tsx`

**Interfaces:**
- Produces: `ComplexIndexPage({ kind }: { kind: ComplexEntityKind })`.
- Produces: `ComplexEntityForm({ kind, slug }: { kind: ComplexEntityKind; slug?: string })`.

- [ ] Write failing tests that verify:

```tsx
render(<ComplexIndexPage kind="projects" />)
- heading Projects
- Add project links to /admin/projects/create
- Edit Northstar Commerce links to /admin/projects/northstar-commerce/edit
- deleting Northstar Commerce removes its card after confirmation

render(<ComplexEntityForm kind="projects" />)
- heading Create project
- all 14 Project labels render
- submitting calls router.push("/admin/projects")

render(<ComplexEntityForm kind="posts" slug="dense-interfaces" />)
- heading Edit post
- Slug contains dense-interfaces
- Published is checked

render(<ComplexEntityForm kind="experiences" slug="missing" />)
- text Experience not found
- link Back to experiences
```

Mock `useRouter` from `next/navigation` with a `push` spy.

- [ ] Run `npm test -- tests/components/admin/complex-crud.test.tsx`; expect failure because both components are missing.

- [ ] Implement `ComplexIndexPage` as a client component:

```tsx
const [records, setRecords] = useState(() => config.records.map(clone))
const [deleting, setDeleting] = useState<ComplexRecord | null>(null)
```

Render `AdminPageHeader`, `CardGrid`, and `EntityCard`. The add action is a Link to `${indexHref}/create`; each edit action is a Link to `${indexHref}/${record.slug}/edit`; delete uses `ConfirmDialog` and removes local state.

- [ ] Implement `ComplexEntityForm` as a client component:

```tsx
const record = slug ? config.records.find((item) => item.slug === slug) : undefined
if (slug && !record) return notFoundState
const { register, handleSubmit } = useForm({ defaultValues: record?.values ?? {} })
const submit = () => router.push(config.indexHref)
```

Render:

- `AdminPageHeader` with `Create {singular}` or `Edit {singular}`.
- Back link to `indexHref`.
- A `noValidate` form.
- text/url/number/date inputs.
- textarea controls.
- checkbox control for booleans.
- select controls with provided options.
- checkbox-group controls registered under one field name.
- Cancel Link and Save button.
- Not-found bordered state and `Back to {title.toLowerCase()}` link.

- [ ] Run the focused tests; expect all complex component cases to pass.
- [ ] Commit with `feat: add complex admin CRUD components`.

---

### Task 3: Complex Routes

**Files:**
- Create:
  - `app/admin/projects/page.tsx`
  - `app/admin/projects/create/page.tsx`
  - `app/admin/projects/[slug]/edit/page.tsx`
  - `app/admin/posts/page.tsx`
  - `app/admin/posts/create/page.tsx`
  - `app/admin/posts/[slug]/edit/page.tsx`
  - `app/admin/experiences/page.tsx`
  - `app/admin/experiences/create/page.tsx`
  - `app/admin/experiences/[slug]/edit/page.tsx`
- Create: `tests/app/admin/ComplexCrudRoutes.test.tsx`

**Interfaces:**
- Index pages render `ComplexIndexPage`.
- Create pages render `ComplexEntityForm` without slug.
- Edit pages await Next.js 16 `params: Promise<{ slug: string }>` and pass the resolved slug.

- [ ] Write a failing route test that imports the three index pages and three create pages, renders each, and asserts headings `Projects`, `Posts`, `Experiences`, `Create project`, `Create post`, and `Create experience`.
- [ ] Run the route test; expect module resolution failure.
- [ ] Create all nine route files with model-specific metadata.
- [ ] Run focused route and complex component tests; expect all to pass.
- [ ] Commit with `feat: add complex admin CRUD routes`.

---

### Task 4: Final Verification

- [ ] Run `npm test`; expect all suites to pass.
- [ ] Run `npm run lint`; expect exit code 0.
- [ ] Run `npx prisma validate`; expect schema validation success.
- [ ] Run `npm run build`; expect all admin index, create, and dynamic edit routes.
- [ ] Run `git diff --check`, confirm no migration was added, revert generated-only `next-env.d.ts`, and confirm a clean worktree.
