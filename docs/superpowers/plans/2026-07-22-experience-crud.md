# Experience CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a slug-based Experience CRUD with dedicated admin pages, sanitized Tiptap HTML, and reusable searchable infinite relation selects.

**Architecture:** Experience receives dedicated Prisma/API/service/page layers rather than using the old mock complex-entity configuration. A controlled `ExperienceForm` composes a reusable Tiptap editor and endpoint-agnostic `InfiniteSelect`; entity-specific TanStack infinite-query hooks adapt the existing paginated relation APIs into options.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma 7/PostgreSQL, React Hook Form, Zod 4, TanStack Query 5, Axios, Tiptap 3.28, sanitize-html 2.17, Tailwind CSS 3

## Global Constraints

- Public Experience identity and all Experience routes use `slug`; numeric IDs stay internal to Prisma.
- Company is required and single-select; Project Highlight is optional and single-select; Skills are optional and multi-select.
- Store description as sanitized HTML, permitting only the editor features defined below.
- Create and edit use dedicated pages, never a modal.
- The Experience index uses one full-width card per row.
- All new reusable exported type declarations live in `.d.ts` modules under `types/`.
- Follow the existing landing/admin theme variables, borders, typography, focus states, and Button/Badge/Alert primitives.
- Preserve Projects and Posts mock configuration while removing only Experience mock configuration.
- Do not create or run automated tests during this refactor; use Prisma, lint, build, and manual verification instead.
- Preserve unrelated user changes and inspect `git status --short` before every commit.

---

## File Map

### Data and validation

- Modify `package.json` and `package-lock.json`: add Tiptap and sanitizer dependencies.
- Modify `prisma/schema.prisma`: correct and make the Project Highlight relation optional.
- Create `prisma/migrations/20260722130000_update_experience_project_highlight/migration.sql`: nullable foreign key migration.
- Create `types/experience.d.ts`: API DTOs, relation options, and select contracts.
- Create `lib/form/experience-schema.ts`: create/update request validation.
- Create `lib/html/rich-text.ts`: sanitize editor HTML and derive card text.
- Create `lib/api/experience-relations.ts`: resolve relation slugs and return field errors.

### API and services

- Create `app/api/experiences/route.ts`: paginated GET and transactional POST.
- Create `app/api/experiences/[slug]/route.ts`: detail GET, PATCH, and DELETE.
- Create `lib/services/experiences/get-experiences.ts`.
- Create `lib/services/experiences/get-experience.ts`.
- Create `lib/services/experiences/create-experience.ts`.
- Create `lib/services/experiences/update-experience.ts`.
- Create `lib/services/experiences/delete-experience.ts`.
- Create `lib/services/companies/get-infinite-companies.ts`.
- Create `lib/services/project-highlights/get-infinite-project-highlights.ts`.
- Create `lib/services/skills/get-infinite-skills.ts`.
- Modify `app/api/companies/route.ts`, `app/api/project-highlights/route.ts`, and `app/api/skills/route.ts`: make relation search case-insensitive.

### Reusable UI and Experience pages

- Create `components/form/infinite-select.tsx`.
- Create `components/form/rich-text-editor.tsx`.
- Create `components/shared/rich-text-content.tsx`.
- Create `components/admin/experience-form.tsx`.
- Create `components/admin/experience-card.tsx`.
- Create `components/admin/experience-detail.tsx`.
- Modify `components/form/input.tsx`: remove hard-coded email input metadata so date/text controls remain semantically correct.
- Create `app/admin/experiences/page.tsx`.
- Create `app/admin/experiences/experiences-client-page.tsx`.
- Create `app/admin/experiences/create/page.tsx`.
- Create `app/admin/experiences/[slug]/page.tsx`.
- Create `app/admin/experiences/[slug]/experience-detail-client.tsx`.
- Create `app/admin/experiences/[slug]/edit/page.tsx`.
- Create `app/admin/experiences/[slug]/edit/edit-experience-client.tsx`.
- Modify `app/globals.css`: editor and rendered rich-text typography.
- Modify `lib/constants/complex-entities.ts` and `types/admin.d.ts`: remove Experience mock surface.

---

### Task 1: Install Editor and Sanitizer Dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: Tiptap React/editor packages and server-side `sanitize-html` with TypeScript declarations.

- [ ] **Step 1: Install pinned runtime packages**

Run:

```bash
npm install @tiptap/react@^3.28.0 @tiptap/pm@^3.28.0 @tiptap/starter-kit@^3.28.0 @tiptap/extensions@^3.28.0 sanitize-html@^2.17.5
npm install --save-dev @types/sanitize-html@^2.16.1
```

Expected: npm exits with code 0 and updates both package files. Tiptap's Next.js guide requires `@tiptap/react`, `@tiptap/pm`, and StarterKit; `@tiptap/extensions` supplies Placeholder.

- [ ] **Step 2: Verify dependency resolution**

Run:

```bash
npm ls @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extensions sanitize-html @types/sanitize-html
git diff --check
```

Expected: every package resolves to one 3.28.x or 2.x version and both commands exit 0.

- [ ] **Step 3: Commit dependencies**

```bash
git add package.json package-lock.json
git diff --cached --check
git commit -m "build: add rich text editor dependencies"
```

---

### Task 2: Update the Prisma Experience Relation

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260722130000_update_experience_project_highlight/migration.sql`

**Interfaces:**
- Produces: `Experience.projectHighlight: ProjectHighlight | null` and `Experience.projectHighlightId: number | null` in the generated client.

- [ ] **Step 1: Correct and relax the relation**

Replace the Experience model with this field order and relation shape:

```prisma
model Experience {
  id                 Int               @id @default(autoincrement())
  companyId          Int               @map("company_id")
  company            Company           @relation(fields: [companyId], references: [id])
  role               String
  slug               String            @unique
  startDate          DateTime           @map("start_date")
  endDate            DateTime?          @map("end_date")
  location           String
  description        String             @db.Text
  projectHighlightId Int?               @map("project_highlight_id")
  projectHighlight   ProjectHighlight?  @relation(fields: [projectHighlightId], references: [id])
  skills             Skill[]
  createdAt          DateTime            @default(now()) @map("created_at")
  updatedAt          DateTime            @updatedAt @map("updated_at")

  @@map("experiences")
}
```

- [ ] **Step 2: Add the explicit migration**

Create the migration SQL:

```sql
ALTER TABLE "experiences"
ALTER COLUMN "project_highlight_id" DROP NOT NULL;
```

Renaming `higlight` needs no SQL because it is only a Prisma relation-field correction.

- [ ] **Step 3: Format, validate, migrate, and generate**

Run:

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev
npx prisma generate
```

Expected: schema validates, the named migration is applied once, and the generated client exposes nullable `projectHighlight`.

- [ ] **Step 4: Commit schema and migration**

```bash
git add prisma/schema.prisma prisma/migrations/20260722130000_update_experience_project_highlight/migration.sql
git diff --cached --check
git commit -m "refactor: make experience highlight optional"
```

---

### Task 3: Define Experience Contracts, Validation, and HTML Safety

**Files:**
- Create: `types/experience.d.ts`
- Create: `lib/form/experience-schema.ts`
- Create: `lib/html/rich-text.ts`
- Create: `lib/api/experience-relations.ts`

**Interfaces:**
- Produces: `ExperienceWithRelations`, `ExperienceListItem`, `RelationOption`, `ExperienceSchema`, `UpdateExperienceSchema`, `sanitizeRichText`, `richTextToPlainText`, and `resolveExperienceRelations`.

- [ ] **Step 1: Add exported `.d.ts` contracts**

Define these contracts in `types/experience.d.ts`:

```ts
import type { Company, Experience, ProjectHighlight, Skill } from "@/prisma/generated/prisma/client";

export type ExperienceWithRelations = Experience & {
  company: Company;
  projectHighlight: ProjectHighlight | null;
  skills: Skill[];
};

export type ExperienceListItem = ExperienceWithRelations & {
  descriptionText: string;
};

export type RelationOption = {
  value: string;
  label: string;
};

export type ExperienceRelationInput = {
  companySlug: string;
  projectHighlightSlug?: string | null;
  skillSlugs: string[];
};
```

- [ ] **Step 2: Add the Zod form contract**

Create `experienceSchema` with exact fields:

```ts
const experienceFieldsSchema = z.object({
    companySlug: z.string().trim().min(1, "The company field is required."),
    role: z.string().trim().min(1, "The role field is required.").max(255),
    slug: slugInputSchema,
    startDate: z.iso.date("The start date must be a valid date."),
    endDate: z.union([z.iso.date(), z.literal("")]).transform((value) => value || null),
    location: z.string().trim().min(1, "The location field is required.").max(255),
    projectHighlightSlug: z
      .string()
      .trim()
      .transform((value) => value || null)
      .nullable()
      .optional(),
    skillSlugs: z.array(z.string().trim().min(1)).transform((values) => [...new Set(values)]),
    description: z.string().trim().min(1, "The description field is required.").max(100_000),
  });

export const experienceSchema = experienceFieldsSchema.refine(
  (data) => !data.endDate || data.endDate >= data.startDate,
  {
    path: ["endDate"],
    message: "The end date must be on or after the start date.",
  },
);

export const updateExperienceSchema = experienceFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "The end date must be on or after the start date.",
  });

export type ExperienceSchema = z.input<typeof experienceSchema>;
export type ParsedExperienceSchema = z.output<typeof experienceSchema>;
export type UpdateExperienceSchema = z.input<typeof updateExperienceSchema>;
```

Use `slugInputSchema` from `lib/slug.ts`. Set form defaults explicitly so `skillSlugs` is `[]`, `endDate` is `""`, and `projectHighlightSlug` is `""`.

- [ ] **Step 3: Add sanitizer and plain-text extraction**

Implement `lib/html/rich-text.ts` with one shared allowlist:

```ts
import sanitizeHtml from "sanitize-html";

const richTextOptions: sanitizeHtml.IOptions = {
  allowedTags: ["p", "h2", "h3", "strong", "em", "u", "ul", "ol", "li", "blockquote", "a", "br"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  transformTags: {
    a: (_tagName, attributes) => ({
      tagName: "a",
      attribs: {
        href: attributes.href ?? "",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    }),
  },
};

export function sanitizeRichText(html: string) {
  return sanitizeHtml(html, richTextOptions).trim();
}

export function richTextToPlainText(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
```

- [ ] **Step 4: Resolve relation slugs centrally**

Implement `resolveExperienceRelations(input)` to query Company, optional Project Highlight, and all unique Skills in parallel by slug. Return:

```ts
type ResolvedExperienceRelations = {
  companyId: number;
  companyName: string;
  projectHighlightId: number | null;
  skillIds: number[];
};
```

Throw a small `ExperienceRelationValidationError` carrying `Partial<Record<"companySlug" | "projectHighlightSlug" | "skillSlugs", string[]>>` when a Company/Highlight is missing or when the fetched Skill count differs from the submitted unique slug count. Export a type guard so both API routes map it to HTTP 422 consistently.

- [ ] **Step 5: Verify and commit the foundation**

Run:

```bash
npx tsc --noEmit --incremental false
git diff --check
```

Expected: both exit 0.

Commit:

```bash
git add types/experience.d.ts lib/form/experience-schema.ts lib/html/rich-text.ts lib/api/experience-relations.ts
git diff --cached --check
git commit -m "feat: add experience data contracts"
```

---

### Task 4: Implement Experience API Routes

**Files:**
- Create: `app/api/experiences/route.ts`
- Create: `app/api/experiences/[slug]/route.ts`

**Interfaces:**
- Consumes: schema, sanitizer, relation resolver, `RouteContext`, and Prisma.
- Produces: paginated Experience list plus slug-based detail/create/update/delete API contracts.

- [ ] **Step 1: Implement collection GET**

Parse `page`, `limit`, and `search` exactly like `app/api/companies/route.ts`. Search case-insensitively across `role`, `location`, and `company.name`; order by `startDate desc`, then `createdAt desc`; include `company`, nullable `projectHighlight`, and `skills` ordered by name. Return `LegacyMetaPagination` and map every record to:

```ts
{
  ...experience,
  descriptionText: richTextToPlainText(experience.description),
}
```

- [ ] **Step 2: Implement collection POST**

Perform this sequence:

1. Parse `experienceSchema`.
2. Resolve relation slugs with `resolveExperienceRelations` so the selected Company name is available.
3. Normalize the submitted slug, or the Company-name-plus-Role fallback, with `normalizeSlug`.
4. Return 422 for an empty or duplicate slug.
5. Sanitize description and reject it as required when `richTextToPlainText(cleanDescription)` is empty.
6. Create with nested Skill connections using resolved numeric IDs.
7. Include all relations and return `ApiResponse<ExperienceWithRelations>` with status 201.

Use `new Date(`${date}T00:00:00.000Z`)` for stored dates so date-only values do not shift with the server timezone.

- [ ] **Step 3: Implement detail GET**

Read and trim `params.slug`, return 400 when empty, then `findUnique` with all relations. Return 404 for a missing Experience and `{ data: experience }` for success.

- [ ] **Step 4: Implement PATCH**

Load the existing record with all relations first, parse `updateExperienceSchema`, then build and parse a complete merged Experience input so cross-field date validation always sees both dates. Resolve the complete merged Company/Highlight/Skill slug set, normalize a supplied slug, validate uniqueness excluding the current record, sanitize a supplied description, and update nested Skills with `set`. A supplied empty `projectHighlightSlug` resolves to `null` and disconnects the optional relation. Return the updated record with all relations.

- [ ] **Step 5: Implement DELETE and error mapping**

Delete by slug and return `DeleteResponse`. Both route files must map:

- Zod failures to 422 using `z.flattenError(error).fieldErrors`;
- relation validation errors to 422 with their field map;
- `P2002` to a slug field error;
- `P2025` to 404;
- unknown failures to 500 without exposing stack traces.

- [ ] **Step 6: Verify routes and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint app/api/experiences
git diff --check
```

Expected: all commands exit 0.

Commit:

```bash
git add app/api/experiences
git diff --cached --check
git commit -m "feat: add experience API"
```

---

### Task 5: Add Experience CRUD and Infinite Relation Services

**Files:**
- Create: `lib/services/experiences/get-experiences.ts`
- Create: `lib/services/experiences/get-experience.ts`
- Create: `lib/services/experiences/create-experience.ts`
- Create: `lib/services/experiences/update-experience.ts`
- Create: `lib/services/experiences/delete-experience.ts`
- Create: `lib/services/companies/get-infinite-companies.ts`
- Create: `lib/services/project-highlights/get-infinite-project-highlights.ts`
- Create: `lib/services/skills/get-infinite-skills.ts`
- Modify: `app/api/companies/route.ts`
- Modify: `app/api/project-highlights/route.ts`
- Modify: `app/api/skills/route.ts`

**Interfaces:**
- Produces: `useGetExperiences`, `useGetExperience`, `useCreateExperience`, `useUpdateExperience`, `useDeleteExperience`, and three infinite option hooks.

- [ ] **Step 1: Add Experience query hooks**

`useGetExperiences(params)` requests `/api/experiences` and returns `PaginatedResponse<ExperienceListItem, LegacyMetaPagination>` with query key `["experiences", { page, limit, search }]` and `keepPreviousData`. `useGetExperience(slug)` requests the encoded detail URL with query key `["experiences", slug]` and `enabled: Boolean(slug)`.

- [ ] **Step 2: Add Experience mutation hooks**

Use these exact mutation contracts:

```ts
useCreateExperience:
  useMutation<ApiResponse<ExperienceWithRelations>, AxiosError<ValidationErrorResponse<keyof ExperienceSchema>>, ExperienceSchema>

useUpdateExperience:
  useMutation<ApiResponse<ExperienceWithRelations>, AxiosError<ValidationErrorResponse<keyof ExperienceSchema>>, MutationVariables<UpdateExperienceSchema, "slug">>

useDeleteExperience:
  useMutation<DeleteResponse, AxiosError<DeleteErrorResponse>, string>
```

Invalidate `["experiences"]` after every mutation. Update additionally invalidates the old and returned slug detail keys.

- [ ] **Step 3: Add infinite Company options**

Create `useGetInfiniteCompanies(search, limit = 20)` using:

```ts
useInfiniteQuery({
  queryKey: ["companies", "infinite", { search, limit }],
  initialPageParam: 1,
  queryFn: ({ pageParam }) => getCompaniesPage({ page: pageParam, limit, search }),
  getNextPageParam: (lastPage) =>
    lastPage.meta.hasNextPage ? lastPage.meta.currentPage + 1 : undefined,
  select: (data) => ({
    ...data,
    options: data.pages.flatMap((page) => page.data.map((company) => ({ value: company.slug, label: company.name }))),
  }),
});
```

Keep the page fetcher private to this file and type it as `PaginatedResponse<Company, LegacyMetaPagination>`.

- [ ] **Step 4: Add infinite Highlight and Skill options**

Use the same query boundary with keys `["project-highlights", "infinite", { search, limit }]` and `["skills", "infinite", { search, limit }]`. Account for the existing Project Highlight API's `MetaPagination.page` while Skill uses `LegacyMetaPagination.currentPage`. Map both entities from `slug/name` to `RelationOption`.

- [ ] **Step 5: Make relation API search case-insensitive**

Add `mode: "insensitive"` to every Prisma string `contains` filter used by search in the Company, Project Highlight, and Skill collection routes. Do not alter pagination metadata or response shapes.

- [ ] **Step 6: Verify and commit services**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint lib/services/experiences lib/services/companies/get-infinite-companies.ts lib/services/project-highlights/get-infinite-project-highlights.ts lib/services/skills/get-infinite-skills.ts app/api/companies/route.ts app/api/project-highlights/route.ts app/api/skills/route.ts
git diff --check
```

Expected: all commands exit 0.

Commit:

```bash
git add lib/services/experiences lib/services/companies/get-infinite-companies.ts lib/services/project-highlights/get-infinite-project-highlights.ts lib/services/skills/get-infinite-skills.ts app/api/companies/route.ts app/api/project-highlights/route.ts app/api/skills/route.ts
git diff --cached --check
git commit -m "feat: add experience data services"
```

---

### Task 6: Build the Reusable Infinite Select

**Files:**
- Modify: `types/experience.d.ts`
- Create: `components/form/infinite-select.tsx`

**Interfaces:**
- Consumes: `RelationOption` and query-state props.
- Produces: one controlled `InfiniteSelect` supporting single and multiple modes without knowing any endpoint.

- [ ] **Step 1: Add the discriminated prop contract**

Append these declarations:

```ts
type InfiniteSelectBaseProps = {
  id: string;
  label: string;
  placeholder: string;
  searchPlaceholder?: string;
  options: RelationOption[];
  search: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
};

export type InfiniteSelectProps = InfiniteSelectBaseProps &
  (
    | {
        multiple?: false;
        value: RelationOption | null;
        onChange: (value: RelationOption | null) => void;
      }
    | {
        multiple: true;
        value: RelationOption[];
        onChange: (value: RelationOption[]) => void;
      }
  );
```

- [ ] **Step 2: Implement trigger, dropdown, and selection behavior**

Build a client component that:

- toggles an absolutely positioned `role="listbox"` dropdown from a styled button;
- closes on outside pointer down and Escape;
- sets `aria-expanded`, `aria-controls`, `aria-invalid`, and `aria-multiselectable` correctly;
- displays selected single label or removable multiple Badge chips;
- excludes selected items from repeated multi-select insertion;
- clears search on close but never discards selected option objects;
- uses Button for clear/retry controls and ChevronDown, Check, Search, X, LoaderCircle icons;
- renders explicit “No options found” and “Failed to load options” rows.

- [ ] **Step 3: Add debounced search and infinite sentinel**

Keep immediate input state inside the component, delay `onSearchChange` by 300 ms with `useEffect`/`setTimeout`, and observe a bottom sentinel only while open and `hasNextPage`. The observer calls `onLoadMore` once per intersection unless `isFetchingNextPage` is true. Disconnect it in effect cleanup.

- [ ] **Step 4: Add keyboard navigation**

Track an active option index. ArrowDown/ArrowUp wrap through visible options, Enter selects the active option, Escape closes, and Home/End jump to boundaries. Use `aria-activedescendant` and stable IDs derived from `id` plus the option slug.

- [ ] **Step 5: Verify and commit the select**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint components/form/infinite-select.tsx
git diff --check
```

Expected: all commands exit 0.

Commit:

```bash
git add types/experience.d.ts components/form/infinite-select.tsx
git diff --cached --check
git commit -m "feat: add infinite relation select"
```

---

### Task 7: Build the Tiptap Editor and Rich Text Renderer

**Files:**
- Create: `components/form/rich-text-editor.tsx`
- Create: `components/shared/rich-text-content.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: controlled `RichTextEditor({ id, label, value, onChange, errorMessage, required })` and `RichTextContent({ html, className })`.

- [ ] **Step 1: Configure the controlled editor**

Use `useEditor` with `immediatelyRender: false`, `content: value`, and `onUpdate: ({ editor }) => onChange(editor.getHTML())`. Configure StarterKit as follows:

```ts
StarterKit.configure({
  heading: { levels: [2, 3] },
  code: false,
  codeBlock: false,
  horizontalRule: false,
  strike: false,
}),
Placeholder.configure({ placeholder: "Describe the role, responsibilities, and impact…" }),
```

Use an effect guarded by `editor.getHTML() !== value` to replace content when edit data arrives asynchronously. Do not emit a redundant form update during external synchronization.

- [ ] **Step 2: Implement the toolbar**

Render Button primitives for H2, H3, bold, italic, underline, bullet list, ordered list, blockquote, undo, and redo. Reflect `editor.isActive(...)` with `bg-fg text-bg`. Disable commands that cannot run. Add a link control that opens a compact inline URL input, applies `setLink({ href })`, and provides `unsetLink`; reject protocols outside http, https, and mailto before applying.

- [ ] **Step 3: Implement rendered content**

`RichTextContent` renders only stored server-sanitized HTML:

```tsx
export function RichTextContent({ html, className }: { html: string; className?: string }) {
  return <div className={cn("rich-text", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
```

- [ ] **Step 4: Add editorial CSS**

Add `.tiptap` and `.rich-text` rules to `app/globals.css` for paragraph spacing, serif H2/H3, list markers and indentation, bordered blockquotes, underlined links, minimum editor height, focus outline removal, and Placeholder's `.is-editor-empty::before`. Use only CSS variables `--bg`, `--fg`, `--muted`, and `--border`.

- [ ] **Step 5: Verify and commit rich text UI**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint components/form/rich-text-editor.tsx components/shared/rich-text-content.tsx
git diff --check
```

Expected: all commands exit 0.

Commit:

```bash
git add components/form/rich-text-editor.tsx components/shared/rich-text-content.tsx app/globals.css
git diff --cached --check
git commit -m "feat: add experience rich text editor"
```

---

### Task 8: Build the Shared Experience Form

**Files:**
- Create: `components/admin/experience-form.tsx`
- Modify: `components/form/input.tsx`

**Interfaces:**
- Consumes: React Hook Form, `ExperienceSchema`, three infinite hooks, `InfiniteSelect`, `RichTextEditor`, and existing Input/Button/Alert primitives.
- Produces: `ExperienceForm` usable by both create and edit clients.

- [ ] **Step 1: Define the form props and defaults**

Use this boundary:

```ts
type ExperienceFormProps = {
  mode: "create" | "edit";
  initialExperience?: ExperienceWithRelations;
  isSubmitting: boolean;
  submitError?: string;
  onSubmit: (
    values: ExperienceSchema,
    applyServerErrors: (error: unknown) => void,
  ) => void;
  onCancel: () => void;
};
```

Initialize Company/Highlight/Skill option objects from `initialExperience`, while React Hook Form stores their slugs. Convert Prisma dates to `YYYY-MM-DD` with UTC getters.

- [ ] **Step 2: Implement automatic editable slug behavior**

Watch Company and Role. Before manual slug input, generate `normalizeSlug(`${company.label}-${role}`)`. Set the manual-edit ref to true for edit mode and on slug change. Place fields in this order: Company, Role, Slug, Start Date, End Date, Location, Project Highlight, Skills, Description.

- [ ] **Step 3: Connect relation queries and selects**

Maintain separate search strings for all three hooks. Flatten each hook's selected `data.options`, pass loading/error/pagination callbacks to `InfiniteSelect`, and use `setValue` to store slugs with `shouldDirty` and `shouldValidate`. Company is required single-select, Highlight is clearable optional single-select, and Skills is optional multi-select.

- [ ] **Step 4: Correct the shared Input metadata**

Remove hard-coded `inputMode="email"` and `autoComplete="email"` from the `<input>` inside `components/form/input.tsx`. Let callers pass those attributes through `...props`; this keeps existing email callers supported and prevents Experience date/text controls from advertising email semantics.

- [ ] **Step 5: Connect Tiptap and server errors**

Use `Controller` for Description. Define `applyServerErrors(error)` inside the form; it reads `AxiosError<ValidationErrorResponse<keyof ExperienceSchema>>`, calls `setError` for every returned field, and leaves values intact. Pass this function as the second argument to the parent `onSubmit`, allowing asynchronous mutation callbacks to map server errors without refs. Show non-field failure text via Alert.

- [ ] **Step 6: Render the dedicated-page form layout**

Use a bordered two-column desktop layout for short controls and make Description span the full width. Add Cancel and Submit Buttons at the bottom; labels are “Create Experience”/“Save Changes” and loading labels are “Creating…”/“Saving…”. No Modal import or state is allowed.

- [ ] **Step 7: Verify and commit form**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint components/admin/experience-form.tsx components/form/input.tsx
git diff --check
```

Expected: all commands exit 0.

Commit:

```bash
git add components/admin/experience-form.tsx components/form/input.tsx
git diff --cached --check
git commit -m "feat: add experience form"
```

---

### Task 9: Build Index, Create, Detail, and Edit Pages

**Files:**
- Create: `components/admin/experience-card.tsx`
- Create: `components/admin/experience-detail.tsx`
- Create: `app/admin/experiences/page.tsx`
- Create: `app/admin/experiences/experiences-client-page.tsx`
- Create: `app/admin/experiences/create/page.tsx`
- Create: `app/admin/experiences/[slug]/page.tsx`
- Create: `app/admin/experiences/[slug]/experience-detail-client.tsx`
- Create: `app/admin/experiences/[slug]/edit/page.tsx`
- Create: `app/admin/experiences/[slug]/edit/edit-experience-client.tsx`

**Interfaces:**
- Consumes: Experience hooks, form, detail/card UI, AdminPageHeader, ConfirmDialog, EmptyContent, Alert, Button, and Badge.
- Produces: the complete `/admin/experiences` route family.

- [ ] **Step 1: Build the full-width Experience card**

Render a bordered horizontal card that collapses vertically on small screens. Show role as serif title, Company as eyebrow, period/location/optional Highlight metadata, `descriptionText` clamped to three lines, Skill badges, and View/Edit/Delete actions. Format a missing end date as `Present`. Use slug-based links and never render description HTML inside the card.

- [ ] **Step 2: Build the index client**

Call `useGetExperiences({ limit: 100 })`, use `AdminPageHeader` with Create action linking to `/admin/experiences/create`, and render `grid grid-cols-1 gap-4`. Provide full-width skeleton cards, EmptyContent, ConfirmDialog delete handling, and shared success/failure Alert state. Keep delete in the index; no form modal state is allowed.

- [ ] **Step 3: Build create page behavior**

The server page exports metadata `title: "Create Experience"` and renders a client wrapper. The wrapper calls `useCreateExperience`; on success use `router.push(`/admin/experiences/${response.data.slug}`)`. Map server field errors through the form and render a Back to Experiences action.

- [ ] **Step 4: Build the detail component and page**

The detail component shows Company eyebrow, Role heading, period/location metadata, optional Project Highlight, Skill badges, and `RichTextContent`. Provide Back, Edit, and Delete actions. The detail client calls `useGetExperience(slug)`, renders a matching skeleton, renders an explicit not-found panel with a Back action when Axios returns 404, confirms delete, and routes back to the index after successful deletion.

The route page awaits `params`, passes the slug to the client, and exports static metadata title `"Experience Detail"`; do not fetch Prisma directly in the page while the client query is the detail source.

- [ ] **Step 5: Build edit page behavior**

The edit client loads `useGetExperience(slug)`, renders the same skeleton/error states, then passes the record into `ExperienceForm`. Call `useUpdateExperience` with the current slug and form payload; on success navigate to the returned slug detail route. Cancel returns to the current detail page.

- [ ] **Step 6: Verify route behavior and commit pages**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint app/admin/experiences components/admin/experience-card.tsx components/admin/experience-detail.tsx
git diff --check
```

Expected: all commands exit 0.

Commit:

```bash
git add app/admin/experiences components/admin/experience-card.tsx components/admin/experience-detail.tsx
git diff --cached --check
git commit -m "feat: add experience admin pages"
```

---

### Task 10: Remove Experience Mock Configuration and Run Final Verification

**Files:**
- Modify: `lib/constants/complex-entities.ts`
- Modify: `types/admin.d.ts`

**Interfaces:**
- Produces: no remaining Experience mock form/records; Projects and Posts stay unchanged; navigation continues pointing to the real index.

- [ ] **Step 1: Remove only Experience mock data**

Delete the `experiences` entry, the now-unused `skills` and `projectHighlights` mock option arrays, and remove `"experiences"` from `ComplexEntityKind`. Keep shared Company options if Projects still consume them. Do not alter Projects or Posts records and fields.

- [ ] **Step 2: Run static verification**

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

Expected: every command exits 0; build lists all Experience admin and API routes without TypeScript or hydration errors.

- [ ] **Step 3: Run manual CRUD and interaction verification**

Start `npm run dev` and verify:

1. Index renders one full-width card per row in light/dark and desktop/mobile layouts.
2. Create auto-generates an editable slug and redirects to detail.
3. Company search, optional Highlight search/clear, and multi-Skill search load subsequent pages at the dropdown sentinel.
4. Keyboard navigation selects and clears relation options.
5. Every approved Tiptap command persists after save; unsupported/script HTML is stripped by the API.
6. Blank end date renders `Present`; invalid date order maps to the End Date field.
7. Edit can change the slug and redirects to the new detail URL.
8. View renders sanitized HTML with editorial styling.
9. Delete confirmation works from index and detail.
10. Missing detail/edit slugs render a not-found state.

- [ ] **Step 4: Review final diff**

Run:

```bash
git status --short
git diff --stat
git diff --check
rg -n "higlight|experience-1|experience-2|type: \"textarea\".*Experience summary" prisma app components lib types
```

Expected: no unintended files, no whitespace errors, and no old Experience typo/mock matches.

- [ ] **Step 5: Commit cleanup**

```bash
git add lib/constants/complex-entities.ts types/admin.d.ts
git diff --cached --check
git commit -m "refactor: remove experience mock configuration"
```

If final verification required fixes in tracked feature files, include those exact files in this final commit and state them in the commit summary.

---

## Completion Criteria

- Prisma migration applies cleanly and Project Highlight is optional.
- Experience list/create/detail/edit/delete work through slug routes.
- Index cards are one-column and full-width.
- Description is authored in the approved Tiptap subset, sanitized server-side, and rendered as HTML only on detail.
- Company/Highlight/Skill selects search their real APIs and load more results by infinite scrolling.
- The same select supports required single, optional single, and optional multiple selection.
- No Experience modal or mock record remains.
- Prisma validation/generation, TypeScript, ESLint, and production build all pass.
- Manual checks cover CRUD, editor safety, select keyboard/infinite behavior, responsive layout, and both themes.
