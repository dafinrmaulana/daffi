# Shared Type Declarations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace repeated cross-module type declarations with explicit generic `.d.ts` modules under `types/`.

**Architecture:** Expand `types/api.d.ts` with reusable transport contracts and add `types/admin.d.ts` for shared admin state and complex-entity configuration types. Migrate services, dynamic API routes, and admin clients in isolated batches, then delete the unused duplicate complex-entity module.

**Tech Stack:** TypeScript, Next.js 16, React 19, React Query, Axios, Prisma

## Global Constraints

- Shared type files use the `.d.ts` extension.
- Shared declarations are module exports and must be imported explicitly; do not add ambient globals.
- Prefer generic contracts over entity-specific structural duplicates.
- Preserve API JSON, React Query keys, mutation behavior, route behavior, and admin UI state behavior.
- Preserve unrelated user changes.
- Keep component props, Zod inference types, login form values, portfolio content types, and Prisma-generated types local.
- Do not create or run tests during the current refactor.

---

### Task 1: Define Shared API and Admin Type Modules

**Files:**
- Modify: `types/api.d.ts`
- Create: `types/admin.d.ts`

**Interfaces:**
- Produces: `ApiResponse<T>`, `PaginatedResponse<T, TMeta>`, `QueryParams`, `ValidationErrorResponse<TField>`, `DeleteResponse`, `DeleteErrorResponse`, `MutationVariables<TPayload, TLocator>`, `RouteContext<TParams>`, `MetaPagination`, `LegacyMetaPagination`, `FormMode`, modal state types, `EventMessage`, and complex-entity types.

- [ ] **Step 1: Expand API declarations**

Make `types/api.d.ts` contain:

```ts
export type MetaPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type LegacyMetaPagination = {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type QueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type ApiResponse<T> = {
  message: string;
  data: T;
};

export type PaginatedResponse<T, TMeta = MetaPagination> = {
  data: T[];
  meta: TMeta;
};

export type ValidationErrorResponse<TField extends PropertyKey> = {
  message: string;
  errors?: Partial<Record<TField, string[]>>;
};

export type DeleteResponse = {
  message: string;
};

export type DeleteErrorResponse = {
  message: string;
  error?: string;
};

export type MutationVariables<TPayload, TLocator extends string> = {
  payload: TPayload;
} & Record<TLocator, string>;

export type RouteContext<TParams extends Record<string, string>> = {
  params: Promise<TParams>;
};
```

- [ ] **Step 2: Add admin declarations**

Create `types/admin.d.ts`:

```ts
export type FormMode = "create" | "edit";

export type FormModalState = {
  open: boolean;
  mode: FormMode;
};

export type OptionalModeFormModalState = {
  open: boolean;
  mode?: FormMode;
};

export type EventMessage = {
  type: "success" | "failed";
  message: string;
};

export type ComplexEntityKind = "projects" | "posts" | "experiences";

export type ComplexFieldType =
  | "text"
  | "url"
  | "number"
  | "date"
  | "textarea"
  | "checkbox"
  | "select"
  | "checkboxGroup";

export type ComplexField = {
  name: string;
  label: string;
  type: ComplexFieldType;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
};

export type ComplexRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  meta: Array<{ label: string; value: string }>;
  values: Record<string, string | boolean | string[]>;
};

export type ComplexEntityConfig = {
  title: string;
  singular: string;
  eyebrow: string;
  indexHref: string;
  fields: ComplexField[];
  records: ComplexRecord[];
};
```

- [ ] **Step 3: Verify and commit shared declarations**

Run:

```bash
npx tsc --noEmit --incremental false
git diff --check
```

Expected: both commands exit with code 0.

Commit:

```bash
git add types/api.d.ts types/admin.d.ts
git diff --cached --check
git commit -m "refactor: add shared type declarations"
```

---

### Task 2: Migrate React Query Service Types

**Files:**
- Modify: `lib/services/companies/create-company.ts`
- Modify: `lib/services/companies/update-company.ts`
- Modify: `lib/services/companies/delete-company.ts`
- Modify: `lib/services/companies/get-companies.ts`
- Modify: `lib/services/skills/create-skill.ts`
- Modify: `lib/services/skills/update-skill.ts`
- Modify: `lib/services/skills/delete-skill.ts`
- Modify: `lib/services/skills/get-skills.ts`
- Modify: `lib/services/tags/create-tag.ts`
- Modify: `lib/services/tags/update-tag.ts`
- Modify: `lib/services/tags/delete-tag.ts`
- Modify: `lib/services/tags/get-tags.ts`
- Modify: `lib/services/project-highlights/create-project-highlight.ts`
- Modify: `lib/services/project-highlights/update-project-highlight.ts`
- Modify: `lib/services/project-highlights/delete-project-highlight.ts`
- Modify: `lib/services/project-highlights/get-project-highlights.ts`
- Modify: `lib/services/users/create-user.ts`
- Modify: `lib/services/users/update-user.ts`
- Modify: `lib/services/users/delete-user.ts`
- Modify: `lib/services/users/get-users.ts`

**Interfaces:**
- Consumes: All generic contracts from `types/api.d.ts`.
- Produces: Existing hooks with unchanged runtime behavior and no repeated structural response, validation, pagination-param, delete, or mutation-variable declarations.

- [ ] **Step 1: Replace create and update response declarations**

Use `ApiResponse<T>` directly in function return types, Axios calls, and mutation generics. Use these data types:

```ts
Company create/update: Company
Skill create/update: Skill
Tag create: TagSchema
Tag update: Tag
Project Highlight create: ProjectHighlightSchema
Project Highlight update: ProjectHighlight
User create: UserSchema
User update: User
```

Replace entity validation declarations with:

```ts
ValidationErrorResponse<keyof CompanySchema>
ValidationErrorResponse<keyof SkillSchema>
ValidationErrorResponse<keyof TagSchema>
ValidationErrorResponse<keyof ProjectHighlightSchema>
ValidationErrorResponse<keyof UserSchema>
```

Remove the duplicated entity-specific `*ValidationErrorResponse`, `Create*Response`, and `Update*Response` structural declarations.

- [ ] **Step 2: Replace update variable declarations**

Use these exact aliases or annotations:

```ts
MutationVariables<UpdateCompanySchema, "slug">
MutationVariables<UpdateSkillSchema, "slug">
MutationVariables<UpdateTagSchema, "slug">
MutationVariables<UpdateProjectHighlightSchema, "slug">
MutationVariables<Partial<UserSchema>, "username">
```

Preserve locator destructuring and encoded URLs.

- [ ] **Step 3: Replace delete declarations**

Use `DeleteResponse` for all delete Axios response and mutation return types. Use `DeleteErrorResponse` for Company and Skill Axios errors, preserving their existing error handling. Remove the duplicated delete response declarations.

- [ ] **Step 4: Replace collection declarations**

Use `QueryParams` for all five collection hooks. Use these response types:

```ts
PaginatedResponse<Company, LegacyMetaPagination>
PaginatedResponse<Skill, LegacyMetaPagination>
PaginatedResponse<Tag, LegacyMetaPagination>
PaginatedResponse<ProjectHighlight>
PaginatedResponse<User>
```

The Tag metadata change is type-only and aligns it with the existing API response using `currentPage`, `perPage`, and `hasPreviousPage`.

- [ ] **Step 5: Verify and commit service migration**

Run:

```bash
npm run lint
npx tsc --noEmit --incremental false
git diff --check
```

Expected: all commands exit with code 0.

Commit all files under the five service directories with:

```bash
git add lib/services/companies lib/services/skills lib/services/tags lib/services/project-highlights lib/services/users
git diff --cached --check
git commit -m "refactor: reuse shared API types"
```

---

### Task 3: Migrate Route and Admin Types

**Files:**
- Modify: `app/api/companies/[slug]/route.ts`
- Modify: `app/api/skills/[slug]/route.ts`
- Modify: `app/api/tags/[slug]/route.ts`
- Modify: `app/api/project-highlights/[slug]/route.ts`
- Modify: `app/api/users/[username]/route.ts`
- Modify: `app/admin/companies/company-client-page.tsx`
- Modify: `app/admin/skills/skill-client-page.tsx`
- Modify: `app/admin/tags/tags-client-page.tsx`
- Modify: `app/admin/project-highlights/project-highlights-client-page.tsx`
- Modify: `app/admin/users/users-client-page.tsx`

**Interfaces:**
- Consumes: `RouteContext`, `ValidationErrorResponse`, and shared admin state types.
- Produces: Existing route handlers and pages without repeated route context, modal state, event message, or validation response structures.

- [ ] **Step 1: Replace dynamic route contexts**

Remove each local `Context` declaration. Type handlers with:

```ts
RouteContext<{ slug: string }>
```

for Company, Skill, Tag, and Project Highlight, and:

```ts
RouteContext<{ username: string }>
```

for User. Import `RouteContext` with `import type` from `@/types/api`.

- [ ] **Step 2: Replace admin modal and event declarations**

Company, Skill, and Tag import and use `FormModalState`. User and Project Highlight import and use `OptionalModeFormModalState`. All five pages use `EventMessage` for their notification state; remove local and inline duplicates.

- [ ] **Step 3: Replace admin validation declarations**

Remove local validation response types. Use these Axios error contracts:

```ts
ValidationErrorResponse<keyof CompanySchema>
ValidationErrorResponse<keyof SkillSchema>
ValidationErrorResponse<keyof TagSchema>
ValidationErrorResponse<keyof ProjectHighlightSchema>
ValidationErrorResponse<keyof UserSchema>
```

Keep current field-error loops and fallback messages unchanged.

- [ ] **Step 4: Verify and commit route/admin migration**

Run:

```bash
npm run lint
npx tsc --noEmit --incremental false
git diff --check
```

Expected: all commands exit with code 0.

Commit:

```bash
git add app/api/companies/'[slug]'/route.ts app/api/skills/'[slug]'/route.ts app/api/tags/'[slug]'/route.ts app/api/project-highlights/'[slug]'/route.ts app/api/users/'[username]'/route.ts app/admin/companies/company-client-page.tsx app/admin/skills/skill-client-page.tsx app/admin/tags/tags-client-page.tsx app/admin/project-highlights/project-highlights-client-page.tsx app/admin/users/users-client-page.tsx
git diff --cached --check
git commit -m "refactor: reuse shared route and admin types"
```

---

### Task 4: Consolidate Complex Entity Types

**Files:**
- Modify: `lib/constants/complex-entities.ts`
- Delete: `lib/admin/complex-entities.ts`

**Interfaces:**
- Consumes: Complex entity declarations from `types/admin.d.ts`.
- Produces: One runtime config source with no duplicate module.

- [ ] **Step 1: Move the constant module to shared type imports**

Remove `ComplexEntityKind`, `ComplexFieldType`, `ComplexField`, `ComplexRecord`, and `ComplexEntityConfig` declarations from `lib/constants/complex-entities.ts`. Add:

```ts
import type { ComplexEntityConfig, ComplexEntityKind } from "@/types/admin";
```

Keep all config data unchanged.

- [ ] **Step 2: Delete the duplicate module**

Delete `lib/admin/complex-entities.ts`. Confirm there are no imports before deletion:

```bash
rg -n '@/lib/admin/complex-entities|lib/admin/complex-entities' . --glob '!node_modules/**' --glob '!.next/**'
```

Expected: no matches.

- [ ] **Step 3: Verify and commit consolidation**

Run:

```bash
npm run lint
npx tsc --noEmit --incremental false
git diff --check
```

Expected: all commands exit with code 0.

Commit:

```bash
git add types/admin.d.ts lib/constants/complex-entities.ts lib/admin/complex-entities.ts
git diff --cached --check
git commit -m "refactor: consolidate complex entity types"
```

---

### Task 5: Audit and Verify the Complete Refactor

**Files:**
- Verify: `types/**/*.d.ts`
- Verify: `app/**/*.{ts,tsx}`
- Verify: `lib/**/*.{ts,tsx}`

**Interfaces:**
- Consumes: All migrations from Tasks 1–4.
- Produces: Evidence that the shared declarations are complete, explicit, and buildable.

- [ ] **Step 1: Audit remaining declarations**

Run:

```bash
rg -n '^(export\s+)?(type|interface)\s+[A-Za-z0-9_]+' app components lib types --glob '*.{ts,tsx}'
rg -n 'type (Context|FormModalState|ModalFormState|EventMessage|.*ValidationErrorResponse)' app lib --glob '*.{ts,tsx}'
rg -n 'type Get(Companies|Skills|Tags|ProjectHighlights|Users)Params' lib/services --glob '*.ts'
```

Expected: shared declarations resolve to `types/api.d.ts` and `types/admin.d.ts`; only intentionally local declarations remain elsewhere.

- [ ] **Step 2: Run final static verification**

Run:

```bash
npm run lint
npx tsc --noEmit --incremental false
git diff --check
```

Expected: all commands exit with code 0.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js exits with code 0. Restore only the generated route-reference line in `next-env.d.ts` if the build rewrites it.

- [ ] **Step 4: Confirm final repository state**

Run:

```bash
git status --short
git log -5 --oneline
```

Expected: no uncommitted refactor changes remain and the four implementation commits are present.
