# Slug-Based CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace numeric public identifiers in the five active admin CRUD APIs with username or slug identifiers while preserving integer database primary keys and relations.

**Architecture:** A shared slug utility normalizes all user-entered and generated slugs. Prisma adds unique slug columns to Company, Skill, Tag, and ProjectHighlight through a data-preserving migration; API routes resolve records by slug or username, and React Query/admin clients carry the original string locator through edit and delete operations.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, React Hook Form, TanStack React Query, Zod 4, Prisma 7, PostgreSQL

## Global Constraints

- User uses the existing unique `username`; Company, Skill, Tag, and ProjectHighlight use new unique `slug` fields.
- Integer `id` remains the primary key and all existing relations continue using integer foreign keys.
- Create forms auto-fill slug from name until the user edits slug manually.
- Backend normalizes slug to lowercase ASCII kebab-case and is authoritative.
- Empty create slug falls back to name; omitted update slug preserves the stored slug.
- Duplicate slug or username returns `422` with a field-level error.
- The migration must preserve existing rows and deterministically resolve backfill collisions.
- Do not apply the migration to a database; create and inspect the migration only.
- Do not recreate the deleted test suite. Verify with Prisma tooling, repository audits, lint, and production build.

---

### Task 1: Shared Slug Contract and Form Schemas

**Files:**
- Create: `lib/slug.ts`
- Modify: `lib/form/company-schema.ts`
- Modify: `lib/form/skill-schema.ts`
- Modify: `lib/form/tag-schema.ts`
- Modify: `lib/form/project-highlight-schema.ts`

**Interfaces:**
- Produces: `normalizeSlug(value: string): string`.
- Produces: `slugInputSchema`, accepting an optional string no longer than 255 characters.
- Produces: form payload types with `slug?: string` for all four slug entities.

- [ ] **Step 1: Add the shared normalizer**

Create `lib/slug.ts`:

```ts
import { z } from "zod";

export function normalizeSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255)
    .replace(/-+$/g, "");
}

export const slugInputSchema = z
  .string()
  .trim()
  .max(255, "The slug may not be greater than 255 characters.")
  .optional();
```

- [ ] **Step 2: Add slug to the four form schemas**

Import `slugInputSchema` and add `slug: slugInputSchema` immediately after `name` in `companySchema`, `skillSchema`, `tagSchema`, and `projectHighlightSchema`. Preserve all existing name and description validation.

For schemas with an existing exported update schema, keep deriving it with `.partial()`. Add explicit update schemas to Tag and ProjectHighlight:

```ts
export const updateTagSchema = tagSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided.",
});

export const updateProjectHighlightSchema = projectHighlightSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });
```

Export `UpdateTagSchema` and `UpdateProjectHighlightSchema` from their respective files.

- [ ] **Step 3: Type-check the schema layer**

Run:

```bash
npx tsc --noEmit
```

Expected: existing generated Prisma types may still lack slug, but the form-schema and utility modules report no errors.

- [ ] **Step 4: Commit the shared contract**

```bash
git add lib/slug.ts lib/form/company-schema.ts lib/form/skill-schema.ts lib/form/tag-schema.ts lib/form/project-highlight-schema.ts
git commit -m "feat: add shared slug validation contract"
```

---

### Task 2: Prisma Slug Fields and Data-Preserving Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260722000000_add_slug_identifiers/migration.sql`
- Regenerate (gitignored): `prisma/generated/prisma/**`

**Interfaces:**
- Produces: `Company.slug`, `Skill.slug`, `Tag.slug`, and `ProjectHighlight.slug` as required unique strings.
- Preserves: all integer IDs and relation fields.

- [ ] **Step 1: Add required unique slug fields to Prisma**

Add `slug String @unique` immediately after `id` in Company, Skill, Tag, and ProjectHighlight. Do not modify User or any relation definition.

- [ ] **Step 2: Create the migration SQL**

Create `prisma/migrations/20260722000000_add_slug_identifiers/migration.sql`. For each of `companies`, `skills`, `tags`, and `project_highlights`, the SQL must execute this exact sequence:

```sql
ALTER TABLE "companies" ADD COLUMN "slug" TEXT;
ALTER TABLE "skills" ADD COLUMN "slug" TEXT;
ALTER TABLE "tags" ADD COLUMN "slug" TEXT;
ALTER TABLE "project_highlights" ADD COLUMN "slug" TEXT;

CREATE OR REPLACE FUNCTION pg_temp.backfill_slug(target_table TEXT, fallback_prefix TEXT)
RETURNS VOID AS $$
DECLARE
  source_row RECORD;
  base_slug TEXT;
  candidate_slug TEXT;
  collision_number INTEGER;
  slug_exists BOOLEAN;
BEGIN
  FOR source_row IN EXECUTE format('SELECT "id", "name" FROM %I ORDER BY "id"', target_table) LOOP
    base_slug := TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(source_row."name"), '[^a-z0-9]+', '-', 'g'));
    IF base_slug = '' THEN
      base_slug := fallback_prefix || '-' || source_row."id";
    END IF;

    candidate_slug := base_slug;
    collision_number := 0;

    LOOP
      EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I WHERE "slug" = $1)', target_table)
        INTO slug_exists
        USING candidate_slug;

      EXIT WHEN NOT slug_exists;

      collision_number := collision_number + 1;
      candidate_slug := base_slug || '-' || source_row."id" ||
        CASE WHEN collision_number = 1 THEN '' ELSE '-' || collision_number END;
    END LOOP;

    EXECUTE format('UPDATE %I SET "slug" = $1 WHERE "id" = $2', target_table)
      USING candidate_slug, source_row."id";
  END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT pg_temp.backfill_slug('companies', 'company');
SELECT pg_temp.backfill_slug('skills', 'skill');
SELECT pg_temp.backfill_slug('tags', 'tag');
SELECT pg_temp.backfill_slug('project_highlights', 'project-highlight');

ALTER TABLE "companies" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "skills" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "tags" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "project_highlights" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");
CREATE UNIQUE INDEX "project_highlights_slug_key" ON "project_highlights"("slug");
```

The temporary PostgreSQL function is scoped to the migration session. It processes each table independently and resolves collisions deterministically in ascending ID order.

- [ ] **Step 3: Format, validate, and regenerate Prisma**

Run:

```bash
npx prisma format
npx prisma validate
npx prisma generate
```

Expected: schema formatting and validation succeed; generated `Company`, `Skill`, `Tag`, and `ProjectHighlight` types contain `slug: string`.

- [ ] **Step 4: Inspect migration status without applying it**

Run:

```bash
npx prisma migrate status
```

Expected: Prisma reports the new migration as pending. Do not run `prisma migrate dev`, `prisma migrate deploy`, or direct SQL against the configured database.

- [ ] **Step 5: Commit schema and migration**

```bash
git add prisma/schema.prisma prisma/migrations/20260722000000_add_slug_identifiers
git commit -m "feat: add slug identifiers to CRUD models"
```

---

### Task 3: Create APIs Generate and Validate Slugs

**Files:**
- Modify: `app/api/companies/route.ts`
- Modify: `app/api/skills/route.ts`
- Modify: `app/api/tags/route.ts`
- Modify: `app/api/project-highlights/route.ts`

**Interfaces:**
- Consumes: `normalizeSlug()` and the four create schemas with optional slug.
- Produces: create responses whose records include normalized unique slugs.

- [ ] **Step 1: Resolve the normalized create slug**

In each POST handler, after schema parsing, derive:

```ts
const slug = normalizeSlug(validatedData.slug || validatedData.name);

if (!slug) {
  return NextResponse.json(
    {
      message: "Validation failed",
      errors: { slug: ["The slug field is required."] },
    },
    { status: 422 },
  );
}
```

Remove `slug` from `validatedData` before spreading when needed, then create with `data: { ...validatedData, slug }`.

- [ ] **Step 2: Validate slug uniqueness before create**

Extend each existing duplicate lookup to cover slug. Company currently has no preflight lookup, so add `findUnique({ where: { slug }, select: { id: true } })`. When occupied, return:

```ts
return NextResponse.json(
  {
    message: "Validation failed",
    errors: { slug: ["The slug has already been taken."] },
  },
  { status: 422 },
);
```

Preserve existing name uniqueness behavior for Skill, Tag, and ProjectHighlight.

- [ ] **Step 3: Add P2002 race-condition mapping**

Each POST catch block must map a Prisma `P2002` target containing `slug` to the same `422` slug error. Preserve name/email/username mappings already present.

- [ ] **Step 4: Verify create routes compile**

Run:

```bash
npx tsc --noEmit
```

Expected: no TypeScript errors in the four collection routes.

- [ ] **Step 5: Commit create API behavior**

```bash
git add app/api/companies/route.ts app/api/skills/route.ts app/api/tags/route.ts app/api/project-highlights/route.ts
git commit -m "feat: create CRUD records with unique slugs"
```

---

### Task 4: Dynamic APIs Resolve Slug or Username

**Files:**
- Move: `app/api/users/[id]/route.ts` → `app/api/users/[username]/route.ts`
- Move: `app/api/companies/[id]/route.ts` → `app/api/companies/[slug]/route.ts`
- Move: `app/api/skills/[id]/route.ts` → `app/api/skills/[slug]/route.ts`
- Move: `app/api/tags/[id]/route.ts` → `app/api/tags/[slug]/route.ts`
- Move: `app/api/project-highlights/[id]/route.ts` → `app/api/project-highlights/[slug]/route.ts`

**Interfaces:**
- Produces: PATCH/DELETE endpoints addressed exclusively by username or slug.
- Preserves: existing 404, 409, Zod 422, Prisma P2002, and P2025 semantics.

- [ ] **Step 1: Move dynamic route directories**

Use Git-aware moves:

```bash
git mv 'app/api/users/[id]' 'app/api/users/[username]'
git mv 'app/api/companies/[id]' 'app/api/companies/[slug]'
git mv 'app/api/skills/[id]' 'app/api/skills/[slug]'
git mv 'app/api/tags/[id]' 'app/api/tags/[slug]'
git mv 'app/api/project-highlights/[id]' 'app/api/project-highlights/[slug]'
```

- [ ] **Step 2: Convert the User route to username lookup**

Use `params: Promise<{ username: string }>` and reject an empty trimmed username with `400`. Replace every numeric conversion and `where: { id: ... }` locator with `where: { username }`.

For update uniqueness exclusion, use:

```ts
AND: [{ username: { not: username } }, { OR: orConditions }]
```

Update and delete both use the original URL username. P2002 continues returning field-level username/email errors.

Return the updated User with the same response envelope used by other entities:

```ts
return NextResponse.json({
  message: "User updated successfully",
  data: user,
});
```

- [ ] **Step 3: Convert the four slug routes**

Each route uses `params: Promise<{ slug: string }>` and rejects `!slug.trim()` with `400`. Replace numeric parsing and ID locators with `where: { slug }`.

For PATCH, normalize only a supplied slug:

```ts
const normalizedSlug = validatedData.slug === undefined ? undefined : normalizeSlug(validatedData.slug);

if (validatedData.slug !== undefined && !normalizedSlug) {
  return NextResponse.json(
    { message: "Validation failed", errors: { slug: ["The slug field is required."] } },
    { status: 422 },
  );
}
```

Validate `normalizedSlug` against records whose slug is not the URL slug. Update with `{ ...validatedData, ...(normalizedSlug ? { slug: normalizedSlug } : {}) }`. DELETE uses only `where: { slug }`.

- [ ] **Step 4: Preserve uniqueness and relation errors**

Map `P2002` slug targets to `{ slug: ["The slug has already been taken."] }`. Keep current name uniqueness checks and `P2003` delete messages for Company and Skill. Keep `P2025` as `404` for every entity.

- [ ] **Step 5: Audit dynamic routes**

Run:

```bash
find app/api -type d -name '[[]id[]]' -print
rg -n 'Number\(id\)|where:\s*\{\s*id|Invalid .* id' app/api/{users,companies,skills,tags,project-highlights}
```

Expected: both commands return no output for the five active CRUD APIs.

- [ ] **Step 6: Commit dynamic routes**

```bash
git add app/api/users app/api/companies app/api/skills app/api/tags app/api/project-highlights
git commit -m "refactor: address CRUD APIs by slug"
```

---

### Task 5: React Query Mutations Use String Locators

**Files:**
- Modify: `lib/services/users/update-user.ts`
- Modify: `lib/services/users/delete-user.ts`
- Modify: `lib/services/companies/update-company.ts`
- Modify: `lib/services/companies/delete-company.ts`
- Modify: `lib/services/skills/update-skill.ts`
- Modify: `lib/services/skills/delete-skill.ts`
- Modify: `lib/services/tags/update-tag.ts`
- Modify: `lib/services/tags/delete-tag.ts`
- Modify: `lib/services/project-highlights/update-project-highlight.ts`
- Modify: `lib/services/project-highlights/delete-project-highlight.ts`

**Interfaces:**
- Produces: User mutations accepting `username: string`.
- Produces: four entity mutations accepting `slug: string`.
- Update payloads separate the original locator from editable form payloads.

- [ ] **Step 1: Convert User mutation signatures**

Use:

```ts
type UpdateUserVariables = {
  username: string;
  payload: Partial<UserSchema>;
};
```

PATCH `/api/users/${username}` and make delete accept a `string` username. Invalidation uses `variables.username` and, when returned, the new `data.username`.

Type `UpdateUserResponse.data` as generated Prisma `User`, matching the API response envelope from Task 4.

- [ ] **Step 2: Convert slug mutation signatures**

For Company, Skill, Tag, and ProjectHighlight, update variables follow:

```ts
type UpdateVariables = {
  slug: string;
  payload: UpdateEntitySchema;
};
```

PATCH `/api/<collection>/${slug}`. Delete functions accept `slug: string`. Mutation generic variable types must be string-based, not number-based.

Type update response data with the generated Prisma model (`Company`, `Skill`, `Tag`, or `ProjectHighlight`) rather than the form-input schema, because responses contain IDs, timestamps, and the normalized required slug.

- [ ] **Step 3: Invalidate old and new identifiers**

After update success, invalidate the list key plus detail keys for both `variables.slug` and `data.data.slug` (or username equivalents). Duplicate invalidations are harmless when the identifier did not change.

- [ ] **Step 4: Audit service URLs and types**

Run:

```bash
rg -n '\bid:\s*(number|string)|\$\{id\}' lib/services/{users,companies,skills,tags,project-highlights}/{update-*,delete-*}.ts
```

Expected: no update/delete locator remains named `id`.

- [ ] **Step 5: Commit service changes**

```bash
git add lib/services/users lib/services/companies lib/services/skills lib/services/tags lib/services/project-highlights
git commit -m "refactor: use slug locators in CRUD services"
```

---

### Task 6: Admin Forms Auto-Fill and Submit Slugs

**Files:**
- Modify: `app/admin/users/users-client-page.tsx`
- Modify: `app/admin/companies/company-client-page.tsx`
- Modify: `app/admin/skills/skill-client-page.tsx`
- Modify: `app/admin/tags/tags-client-page.tsx`
- Modify: `app/admin/project-highlights/project-highlights-client-page.tsx`

**Interfaces:**
- Consumes: generated records with slug, `normalizeSlug()`, and string-based mutations.
- Produces: slug inputs with auto-fill-until-manual-edit behavior.

- [ ] **Step 1: Convert User edit and delete state**

Store `usernameToDelete: string | null`, call delete with username, and call update with:

```ts
updateMutation.mutate({ username: selectedUser.username, payload: formData }, callbacks);
```

Continue using numeric ID only for React list keys.

- [ ] **Step 2: Add slug defaults and original locators to four pages**

Add `slug: ""` to create/reset defaults and `slug: record.slug` to edit resets. Update edit mutations to pass `slug: selectedRecord.slug`; update delete state to store the record slug. Numeric IDs remain only in React keys.

- [ ] **Step 3: Add automatic slug synchronization**

In each slug page, import `useEffect`, `useRef`, and `normalizeSlug`. Add:

```ts
const slugManuallyEdited = useRef(false);
const watchedName = watch("name");

useEffect(() => {
  if (!slugManuallyEdited.current) {
    setValue("slug", normalizeSlug(watchedName), { shouldDirty: true });
  }
}, [setValue, watchedName]);
```

Set `slugManuallyEdited.current = false` before opening create and `true` before opening edit. Destructure `watch` and `setValue` from `useForm`.

- [ ] **Step 4: Render the editable slug input**

Capture the registration:

```ts
const slugRegistration = register("slug");
```

Render a required-looking text input after Name, but allow the create fallback while typing:

```tsx
<Input
  id="slug"
  type="text"
  label="Slug"
  placeholder="entity-name"
  errorMessage={errors.slug?.message}
  {...slugRegistration}
  onChange={(event) => {
    slugManuallyEdited.current = true;
    slugRegistration.onChange(event);
  }}
/>
```

Use the existing icon style of each page; do not add a dependency solely for the slug field.

- [ ] **Step 5: Audit client locator usage**

Run:

```bash
rg -n 'ToDelete.*number|set.*ToDelete\([^)]*\.id\)|mutate\(.*\.id|id:\s*String\(selected|id:\s*selected' app/admin/{users,companies,skills,tags,project-highlights}
```

Expected: no edit/delete mutation uses numeric IDs. `key={record.id}` remains allowed.

- [ ] **Step 6: Commit admin behavior**

```bash
git add app/admin/users app/admin/companies app/admin/skills app/admin/tags app/admin/project-highlights
git commit -m "feat: manage CRUD records by editable slugs"
```

---

### Task 7: Final Verification

**Files:**
- Verify: all files changed in Tasks 1–6

**Interfaces:**
- Produces: a migration-ready slug CRUD implementation.

- [ ] **Step 1: Verify Prisma artifacts**

Run:

```bash
npx prisma format
npx prisma validate
npx prisma generate
```

Expected: all commands exit 0.

- [ ] **Step 2: Verify migration remains unapplied**

Run:

```bash
npx prisma migrate status
```

Expected: `20260722000000_add_slug_identifiers` is pending. Do not apply it.

- [ ] **Step 3: Run identifier audits**

Run:

```bash
find app/api -type d -name '[[]id[]]' -print
rg -n 'Number\(id\)|\$\{id\}|Invalid .* id' app/api/{users,companies,skills,tags,project-highlights} lib/services/{users,companies,skills,tags,project-highlights}
```

Expected: both commands return no output for active update/delete flows.

- [ ] **Step 4: Run code quality checks**

Run:

```bash
git diff --check
npm run lint
npm run build
```

Expected: diff check, ESLint, TypeScript compilation, and production build all succeed. Restore generated-only `next-env.d.ts` if Next.js rewrites it.

- [ ] **Step 5: Inspect final repository state**

Run:

```bash
git status --short
git diff --stat
git log -8 --oneline
```

Expected: only intentional slug CRUD changes remain, with no test files recreated and no migration applied.
