# Post CRUD and Public Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the remaining mock Post feature with a real slug-based admin CRUD and a database-backed public Blog that exposes only published Posts.

**Architecture:** Add a typed Post contract, validation/read-time helpers, Tag relation resolver, slug API, TanStack Query admin services, and Post-specific admin components while reusing the existing rich-text and infinite-select primitives. Public Blog pages query Prisma through a server-only data module, serialize results into the same DTO used by admin, and derive metadata from published content.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma 7/PostgreSQL, Zod 4, TanStack Query 5, Axios, React Hook Form, Tiptap 3, Tailwind CSS.

## Global Constraints

- Work directly in the current repository unless the user requests isolation at execution time.
- All Post URLs and mutations use slug; numeric Prisma IDs remain internal.
- Thumbnail accepts only `http`, `https`, or a site-relative `/path`; file upload is deferred.
- Body uses the existing Tiptap extensions and is stored as sanitized HTML.
- Read time is backend-controlled at 200 words per minute, rounded up, with a minimum of one minute.
- Date defaults to today, remains editable, and does not schedule publication.
- Public queries and metadata expose only `published: true` Posts.
- Use full-width, one-column cards for admin and public indexes.
- Automated tests are neither added nor run during this refactor, per the accepted project constraint.
- Each task is verified with targeted static/runtime checks before commit.

---

## File Map

### Create

- `types/post.d.ts`: serialized Post DTO and Post relation input.
- `lib/form/post-schema.ts`: create/update input validation.
- `lib/api/post-relations.ts`: Tag slug resolution and field-level relation errors.
- `lib/post.ts`: DTO serialization, display/date helpers, and read-time calculation.
- `lib/data/published-posts.ts`: server-only public queries.
- `app/api/posts/route.ts`: admin list/create endpoint.
- `app/api/posts/[slug]/route.ts`: admin retrieve/update/delete endpoint.
- `lib/services/posts/get-posts.ts`: admin paginated list query.
- `lib/services/posts/get-post.ts`: admin detail query.
- `lib/services/posts/create-post.ts`: create mutation.
- `lib/services/posts/update-post.ts`: update mutation.
- `lib/services/posts/delete-post.ts`: delete mutation.
- `components/admin/post-form.tsx`: shared create/edit form.
- `components/admin/post-card.tsx`: full-width admin card.
- `components/admin/post-detail.tsx`: admin article detail.
- `app/admin/posts/posts-client-page.tsx`: admin list state and delete flow.
- `app/admin/posts/create/page.tsx`: create flow.
- `app/admin/posts/[slug]/page.tsx`: detail route shell.
- `app/admin/posts/[slug]/post-detail-client.tsx`: detail query/delete state.
- `app/admin/posts/[slug]/edit/page.tsx`: edit route shell.
- `app/admin/posts/[slug]/edit/edit-post-client.tsx`: edit query/mutation state.
- `components/blog/post-article.tsx`: public article presentation.
- `app/blog/page.tsx`: published Blog index.
- `app/blog/[slug]/page.tsx`: published article and dynamic metadata.

### Modify

- `app/admin/posts/page.tsx`: replace the mock page with the real client index.
- `components/blog/post-card.tsx`: consume the real DTO and use a full-width layout.
- `components/layout/header.tsx`: add Blog navigation.
- `components/layout/footer.tsx`: add Blog navigation.
- `lib/constants/main-contents.ts`: remove fixture-only Post type, records, and helper.
- `types/admin.d.ts`: remove mock complex-entity declarations after their last consumer disappears.

### Delete

- `lib/constants/complex-entities.ts`: remove the final schema-driven mock configuration.

---

### Task 1: Post contracts, validation, read time, and Tag resolution

**Files:**

- Create: `types/post.d.ts`
- Create: `lib/form/post-schema.ts`
- Create: `lib/post.ts`
- Create: `lib/api/post-relations.ts`

**Interfaces:**

- Consumes: `slugInputSchema`, `sanitizeRichText`, `richTextToPlainText`, Prisma `Post`/`Tag`, and the Prisma provider.
- Produces:
  - `PostWithRelations`
  - `PostRelationInput`
  - `PostSchema`, `ParsedPostSchema`, `UpdatePostSchema`
  - `calculatePostReadTime(html: string): number`
  - `serializePost(post): PostWithRelations`
  - `formatPostDateInput(value: string | Date): string`
  - `formatPostDate(value: string | Date): string`
  - `resolvePostRelations(input): Promise<{ tagIds: number[] }>`

- [ ] **Step 1: Define the serialized DTO**

Create `types/post.d.ts`:

```ts
import type { Post, Tag } from "@/prisma/generated/prisma/client";

export type PostWithRelations = Omit<Post, "date" | "createdAt" | "updatedAt"> & {
  date: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
};

export type PostRelationInput = {
  tagSlugs: string[];
};
```

- [ ] **Step 2: Define the form and API validation contract**

Create `lib/form/post-schema.ts` with one complete schema and a partial update schema:

```ts
import { z } from "zod";
import { slugInputSchema } from "@/lib/slug";

const postFieldsSchema = z.object({
  title: z.string().trim().min(1, "The title field is required.").max(255),
  slug: slugInputSchema,
  date: z.iso.date("The date field must be a valid date."),
  thumbnail: z.string().trim().min(1, "The thumbnail field is required.").max(2048)
    .refine(
      (value) => value.startsWith("/") || /^https?:\/\/[^\s]+$/i.test(value),
      "The thumbnail must be a site-relative path or an http/https URL.",
    ),
  excerpt: z.string().trim().min(1, "The excerpt field is required.").max(500),
  published: z.boolean().default(false),
  tagSlugs: z.array(z.string().trim().min(1))
    .transform((values) => [...new Set(values)])
    .default([]),
  body: z.string().trim().min(1, "The body field is required.").max(250_000),
});

export const postSchema = postFieldsSchema;
export const updatePostSchema = postFieldsSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided." },
);
export type PostSchema = z.input<typeof postSchema>;
export type ParsedPostSchema = z.output<typeof postSchema>;
export type UpdatePostSchema = z.input<typeof updatePostSchema>;
```

Use explicit `.max(..., "message")` messages matching the established Project wording rather than Zod defaults.

- [ ] **Step 3: Add Post serialization, date formatting, and read-time helpers**

Create `lib/post.ts`:

```ts
import type { Prisma } from "@/prisma/generated/prisma/client";
import { richTextToPlainText } from "@/lib/html/rich-text";
import type { PostWithRelations } from "@/types/post";

export const postInclude = {
  tags: { orderBy: { name: "asc" as const } },
} satisfies Prisma.PostInclude;

export type PostWithPrismaRelations = Prisma.PostGetPayload<{ include: typeof postInclude }>;

export function calculatePostReadTime(html: string) {
  const words = richTextToPlainText(html).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function serializePost(post: PostWithPrismaRelations): PostWithRelations {
  return {
    ...post,
    date: post.date.toISOString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function formatPostDateInput(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function formatPostDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
```

- [ ] **Step 4: Resolve and validate Tag slugs**

Create `lib/api/post-relations.ts`:

```ts
import prisma from "@/lib/providers/prisma";
import type { PostRelationInput } from "@/types/post";

export class PostRelationValidationError extends Error {
  constructor(public errors: { tagSlugs?: string[] }) {
    super("Post relation validation failed");
    this.name = "PostRelationValidationError";
  }
}

export function isPostRelationValidationError(
  error: unknown,
): error is PostRelationValidationError {
  return error instanceof PostRelationValidationError;
}

export async function resolvePostRelations(input: PostRelationInput) {
  const tagSlugs = [...new Set(input.tagSlugs)];
  const tags = tagSlugs.length
    ? await prisma.tag.findMany({
        where: { slug: { in: tagSlugs } },
        select: { id: true, slug: true },
      })
    : [];

  if (tags.length !== tagSlugs.length) {
    const found = new Set(tags.map((tag) => tag.slug));
    const missing = tagSlugs.filter((slug) => !found.has(slug));
    throw new PostRelationValidationError({
      tagSlugs: [`The following tags do not exist: ${missing.join(", ")}.`],
    });
  }

  return { tagIds: tags.map((tag) => tag.id) };
}
```

- [ ] **Step 5: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint types/post.d.ts lib/form/post-schema.ts lib/post.ts lib/api/post-relations.ts
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add types/post.d.ts lib/form/post-schema.ts lib/post.ts lib/api/post-relations.ts
git commit -m "feat: add post data contracts"
```

---

### Task 2: Slug-based Post API

**Files:**

- Create: `app/api/posts/route.ts`
- Create: `app/api/posts/[slug]/route.ts`

**Interfaces:**

- Consumes: Task 1 schemas, `postInclude`, `serializePost`, `calculatePostReadTime`, `resolvePostRelations`, slug normalization, and rich-text sanitation.
- Produces: paginated admin list and create/retrieve/update/delete JSON contracts used by Task 3 services.

- [ ] **Step 1: Implement admin list and create**

Create `app/api/posts/route.ts`. `GET` parses `page`, `limit`, and `search`; searches Title, Excerpt, Body, and Tag name case-insensitively; and orders by `date desc`, then `createdAt desc`. Return the existing `LegacyMetaPagination` shape.

The `POST` write path must follow this exact order:

```ts
const validatedData = postSchema.parse(await request.json());
const relations = await resolvePostRelations(validatedData);
const slug = normalizeSlug(validatedData.slug || validatedData.title);
const body = sanitizeRichText(validatedData.body);

if (!slug) {
  return NextResponse.json(
    { message: "Validation failed", errors: { slug: ["The slug field is required."] } },
    { status: 422 },
  );
}
if (!richTextToPlainText(body)) {
  return NextResponse.json(
    { message: "Validation failed", errors: { body: ["The body field is required."] } },
    { status: 422 },
  );
}

const post = await prisma.post.create({
  data: {
    title: validatedData.title,
    slug,
    date: new Date(`${validatedData.date}T00:00:00.000Z`),
    readTime: calculatePostReadTime(body),
    thumbnail: validatedData.thumbnail,
    excerpt: validatedData.excerpt,
    published: validatedData.published,
    body,
    tags: { connect: relations.tagIds.map((id) => ({ id })) },
  },
  include: postInclude,
});
```

Map Zod and relation failures to `422`, Prisma `P2002` to the Slug field, and unexpected errors to a generic `500`. Return `{ message, data: serializePost(post) }` with status `201`.

- [ ] **Step 2: Implement retrieve, update, and delete**

Create `app/api/posts/[slug]/route.ts`. `GET` and `DELETE` follow the existing Project endpoint status behavior.

For `PATCH`, import `formatPostDateInput` with the other Task 1 helpers, retrieve the current Post with Tags, parse the partial payload, then construct the complete contract:

```ts
const mergedData = postSchema.parse({
  title: validatedData.title ?? currentPost.title,
  slug: validatedData.slug ?? currentPost.slug,
  date: validatedData.date ?? formatPostDateInput(currentPost.date),
  thumbnail: validatedData.thumbnail ?? currentPost.thumbnail,
  excerpt: validatedData.excerpt ?? currentPost.excerpt,
  published: validatedData.published ?? currentPost.published,
  tagSlugs: validatedData.tagSlugs ?? currentPost.tags.map((tag) => tag.slug),
  body: validatedData.body ?? currentPost.body,
});

const body = sanitizeRichText(mergedData.body);
const nextPost = await prisma.post.update({
  where: { slug: currentSlug },
  data: {
    title: mergedData.title,
    slug: normalizeSlug(mergedData.slug || mergedData.title),
    date: new Date(`${mergedData.date}T00:00:00.000Z`),
    readTime:
      validatedData.body !== undefined
        ? calculatePostReadTime(body)
        : (currentPost.readTime ?? calculatePostReadTime(body)),
    thumbnail: mergedData.thumbnail,
    excerpt: mergedData.excerpt,
    published: mergedData.published,
    body,
    tags: { set: relations.tagIds.map((id) => ({ id })) },
  },
  include: postInclude,
});
```

Validate non-empty normalized Slug and meaningful sanitized Body before writing. Check a changed Slug for conflict before update. Map `P2025` to `404`, `P2002` to a Slug `422`, and return the serialized updated record.

- [ ] **Step 3: Verify endpoint compilation and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint app/api/posts/route.ts 'app/api/posts/[slug]/route.ts'
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add app/api/posts
git commit -m "feat: add post API"
```

---

### Task 3: Admin Post data services

**Files:**

- Create: `lib/services/posts/get-posts.ts`
- Create: `lib/services/posts/get-post.ts`
- Create: `lib/services/posts/create-post.ts`
- Create: `lib/services/posts/update-post.ts`
- Create: `lib/services/posts/delete-post.ts`

**Interfaces:**

- Consumes: Task 2 HTTP contracts, shared API response types, Task 1 DTO/schema.
- Produces: `useGetPosts`, `useGetPost`, `useCreatePost`, `useUpdatePost`, and `useDeletePost`.

- [ ] **Step 1: Add list and detail queries**

Implement `useGetPosts(params: QueryParams = {})` with query key `["posts", query]`, `keepPreviousData`, and `GET /api/posts`. Implement `useGetPost(slug)` with key `["posts", slug]`, encoded Slug, and `enabled: Boolean(slug)`.

Use these exact response types:

```ts
PaginatedResponse<PostWithRelations, LegacyMetaPagination>
ApiResponse<PostWithRelations>
```

- [ ] **Step 2: Add create, update, and delete mutations**

Use these mutation signatures:

```ts
useMutation<
  ApiResponse<PostWithRelations>,
  AxiosError<ValidationErrorResponse<keyof PostSchema>>,
  PostSchema
>

useMutation<
  ApiResponse<PostWithRelations>,
  AxiosError<ValidationErrorResponse<keyof PostSchema>>,
  MutationVariables<UpdatePostSchema, "slug">
>

useMutation<DeleteResponse, AxiosError<DeleteErrorResponse>, string>
```

Create invalidates `["posts"]`. Update invalidates the collection, old Slug, and returned Slug. Delete invalidates the collection.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint lib/services/posts
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add lib/services/posts
git commit -m "feat: add post data services"
```

---

### Task 4: Shared Post form

**Files:**

- Create: `components/admin/post-form.tsx`

**Interfaces:**

- Consumes: `PostSchema`, `PostWithRelations`, Task 3 mutations through callbacks, `InfiniteSelect`, `useGetInfiniteTags`, `RichTextEditor`, `Input`, `Textarea`, `Checkbox`, and Button.
- Produces:

```ts
type PostFormProps = {
  mode: "create" | "edit";
  initialPost?: PostWithRelations;
  isSubmitting: boolean;
  submitError?: string;
  onSubmit: (values: PostSchema, applyServerErrors: (error: unknown) => void) => void;
  onCancel: () => void;
};
```

- [ ] **Step 1: Build controlled defaults and slug behavior**

Initialize React Hook Form with:

```ts
defaultValues: {
  title: initialPost?.title ?? "",
  slug: initialPost?.slug ?? "",
  date: formatPostDateInput(initialPost?.date ?? new Date()),
  thumbnail: initialPost?.thumbnail ?? "",
  excerpt: initialPost?.excerpt ?? "",
  published: initialPost?.published ?? false,
  tagSlugs: initialPost?.tags.map((tag) => tag.slug) ?? [],
  body: initialPost?.body ?? "",
}
```

Use the Project form's `slugManuallyEdited` ref behavior exactly: create mode follows normalized Title until Slug input is touched; edit mode never overwrites the existing Slug.

- [ ] **Step 2: Render fields and server-error mapping**

Render this responsive form structure:

```tsx
<div className="grid gap-6 md:grid-cols-2">
  <Input id="title" label="Title" required />
  <Input id="slug" label="Slug" required />
  <Input id="date" label="Publication Date" type="date" required />
  <div>{/* Thumbnail Input followed by URL/path preview */}</div>
  <div className="md:col-span-2"><Textarea id="excerpt" label="Excerpt" required /></div>
  <div className="md:col-span-2"><Checkbox id="published" label="Published" /></div>
  <div className="md:col-span-2"><InfiniteSelect id="tagSlugs" multiple /></div>
  <div className="md:col-span-2"><Controller name="body" render={...RichTextEditor} /></div>
</div>
```

Connect Tags to `useGetInfiniteTags`, preserving selected `{ value: slug, label: name }` options while searching. Use Project's preview-unavailable pattern. Do not render a read-time input.

Map `ValidationErrorResponse<keyof PostSchema>` entries through React Hook Form `setError`. Parse the complete client values with `postSchema.safeParse` before calling the supplied mutation callback.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint components/admin/post-form.tsx
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add components/admin/post-form.tsx
git commit -m "feat: add post form"
```

---

### Task 5: Admin Post cards, detail, and pages

**Files:**

- Create: `components/admin/post-card.tsx`
- Create: `components/admin/post-detail.tsx`
- Modify: `app/admin/posts/page.tsx`
- Create: `app/admin/posts/posts-client-page.tsx`
- Create: `app/admin/posts/create/page.tsx`
- Create: `app/admin/posts/[slug]/page.tsx`
- Create: `app/admin/posts/[slug]/post-detail-client.tsx`
- Create: `app/admin/posts/[slug]/edit/page.tsx`
- Create: `app/admin/posts/[slug]/edit/edit-post-client.tsx`

**Interfaces:**

- Consumes: Task 3 hooks, Task 4 form, Task 1 DTO/helpers, and existing admin feedback primitives.
- Produces: complete admin Post navigation and CRUD UI.

- [ ] **Step 1: Build the full-width card and detail presentation**

`PostCard` accepts:

```ts
{ post: PostWithRelations; onDelete: () => void }
```

Use the Project three-region card structure. The center renders status, Title, date/read time, Excerpt, and Tags. The action region renders View/Edit/Delete. Use `Published` and `Draft` Badge text and format read time as `${post.readTime ?? 1} min read`.

`PostDetail` accepts the same props, renders Back/Edit/Delete, hero thumbnail, status, date/read time, Tags, Excerpt, and:

```tsx
<RichTextContent html={post.body} className="max-w-3xl" />
```

- [ ] **Step 2: Replace the admin index**

Make `app/admin/posts/page.tsx` a metadata shell that renders `PostsClientPage`.

In `posts-client-page.tsx`, call `useGetPosts({ limit: 100 })`; display AdminPageHeader, loading skeletons, failure Alert, empty state, one-column cards, and ConfirmDialog. On successful deletion, close the dialog and show `"Post deleted successfully"`.

- [ ] **Step 3: Add create, detail, and edit flows**

Create page behavior:

```ts
mutation.mutate(values, {
  onSuccess: (response) => router.push(`/admin/posts/${response.data.slug}`),
  onError: (error) => {
    applyServerErrors(error);
    setSubmitError(error.response?.data.message ?? "Failed to create Post");
  },
});
```

Detail and edit client states must match Project's loading, `404`, generic failure, and delete patterns while using Post hooks/routes. Edit success redirects to `response.data.slug`, not the original Slug.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint components/admin/post-card.tsx components/admin/post-detail.tsx app/admin/posts
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add components/admin/post-card.tsx components/admin/post-detail.tsx app/admin/posts
git commit -m "feat: add post admin pages"
```

---

### Task 6: Public published-Post data boundary

**Files:**

- Create: `lib/data/published-posts.ts`

**Interfaces:**

- Consumes: Prisma provider and Task 1 `postInclude`/`serializePost`.
- Produces:
  - `getPublishedPosts(): Promise<PostWithRelations[]>`
  - `getPublishedPost(slug: string): Promise<PostWithRelations | null>`

- [ ] **Step 1: Add server-only public queries**

Create:

```ts
import "server-only";

import prisma from "@/lib/providers/prisma";
import { postInclude, serializePost } from "@/lib/post";

export async function getPublishedPosts() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: postInclude,
  });
  return posts.map(serializePost);
}

export async function getPublishedPost(slug: string) {
  const post = await prisma.post.findFirst({
    where: { slug, published: true },
    include: postInclude,
  });
  return post ? serializePost(post) : null;
}
```

If `server-only` is not directly resolvable in the installed tree, omit only that import; keeping this module imported exclusively from server components remains mandatory.

- [ ] **Step 2: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint lib/data/published-posts.ts
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add lib/data/published-posts.ts
git commit -m "feat: add published post queries"
```

---

### Task 7: Public Blog index, article, navigation, and metadata

**Files:**

- Modify: `components/blog/post-card.tsx`
- Create: `components/blog/post-article.tsx`
- Create: `app/blog/page.tsx`
- Create: `app/blog/[slug]/page.tsx`
- Modify: `components/layout/header.tsx`
- Modify: `components/layout/footer.tsx`

**Interfaces:**

- Consumes: Task 6 queries, Task 1 DTO/date helper, `Section`, `PageIntro`, Badge, Button, and `RichTextContent`.
- Produces: discoverable public Blog routes and dynamic article metadata.

- [ ] **Step 1: Convert the public card to the real DTO**

Change `PostCard` to accept `PostWithRelations`. Use one responsive full-width card:

```tsx
<Link
  href={`/blog/${post.slug}`}
  className="group grid overflow-hidden border border-border bg-bg transition-colors hover:border-fg lg:grid-cols-[22rem_minmax(0,1fr)]"
>
  <div className="aspect-video overflow-hidden bg-muted/10 lg:aspect-auto">{/* image */}</div>
  <div className="p-5 sm:p-7">
    <p>{formatPostDate(post.date)} · {post.readTime ?? 1} min read</p>
    <h2>{post.title}</h2>
    <p>{post.excerpt}</p>
    <div>{post.tags.map((tag) => <Badge key={tag.slug}>{tag.name}</Badge>)}</div>
  </div>
</Link>
```

- [ ] **Step 2: Build the public article**

Create `PostArticle({ post }: { post: PostWithRelations })` with a back-to-Blog action, hero thumbnail, Title, date/read time, Tags, Excerpt, and a two-column article section whose content column is:

```tsx
<RichTextContent html={post.body} className="max-w-3xl" />
```

- [ ] **Step 3: Add `/blog`**

Export stable Metadata `{ title: "Blog", description: "..." }`, call `getPublishedPosts()`, render `PageIntro`, and use:

```tsx
<div className="grid grid-cols-1 gap-5">
  {posts.map((post) => <PostCard key={post.slug} post={post} />)}
</div>
```

If empty, render a bordered landing-styled message without admin actions.

- [ ] **Step 4: Add `/blog/[slug]` and metadata**

Resolve the published Post in both the page and `generateMetadata`. Use React `cache` around the Slug lookup so metadata and page rendering share one request-local query:

```ts
const getPost = cache((slug: string) => getPublishedPost(slug));
```

Return `notFound()` when null. Generate:

```ts
return {
  title: post.title,
  description: post.excerpt,
  alternates: { canonical: `/blog/${post.slug}` },
  keywords: post.tags.map((tag) => tag.name),
  openGraph: {
    type: "article",
    title: post.title,
    description: post.excerpt,
    publishedTime: post.date,
    tags: post.tags.map((tag) => tag.name),
    images: [{ url: post.thumbnail, alt: post.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: post.title,
    description: post.excerpt,
    images: [post.thumbnail],
  },
};
```

- [ ] **Step 5: Add Blog navigation**

Insert `{ href: "/blog", label: "Blog" }` after Work in the Header navigation and add a Blog Link beside Work in the Footer.

- [ ] **Step 6: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint components/blog app/blog components/layout/header.tsx components/layout/footer.tsx
git diff --check
```

Expected: all commands exit `0`.

Commit:

```bash
git add components/blog app/blog components/layout/header.tsx components/layout/footer.tsx
git commit -m "feat: add public blog"
```

---

### Task 8: Remove Post mocks and dead generic declarations

**Files:**

- Delete: `lib/constants/complex-entities.ts`
- Modify: `types/admin.d.ts`
- Modify: `lib/constants/main-contents.ts`

**Interfaces:**

- Consumes: real admin and public feature from Tasks 5 and 7.
- Produces: no remaining Post mock data or dead schema-driven Post types.

- [ ] **Step 1: Confirm the cleanup targets have no live consumers**

Run:

```bash
rg -n "complexEntityConfigs|ComplexEntityKind|ComplexEntityConfig|ComplexFieldType|ComplexRecord|getPost\\(|\\bposts\\b" app components lib types --glob '*.{ts,tsx}'
```

Expected before cleanup: matches are limited to `complex-entities.ts`, mock declarations in `types/admin.d.ts`, Post fixtures/helper in `main-contents.ts`, and the new real feature. Stop and preserve any unrelated live consumer discovered by this command.

- [ ] **Step 2: Remove only dead mock surfaces**

Delete `lib/constants/complex-entities.ts`.

From `types/admin.d.ts`, remove `ComplexEntityKind`, `ComplexFieldType`, `ComplexField`, `ComplexRecord`, and `ComplexEntityConfig`; preserve modal and event types.

From `lib/constants/main-contents.ts`, remove only:

- the fixture `Post` type;
- `posts`;
- `getPost`.

Preserve Project, Experience, skills, testimonials, and their helpers.

- [ ] **Step 3: Verify and commit**

Run:

```bash
rg -n "complexEntityConfigs|ComplexEntityKind|ComplexEntityConfig|getPost\\(" app components lib types --glob '*.{ts,tsx}' || true
npx tsc --noEmit --incremental false
npx eslint types/admin.d.ts lib/constants/main-contents.ts
git diff --check
```

Expected: the first command has no matches; remaining commands exit `0`.

Commit:

```bash
git add -A lib/constants/complex-entities.ts types/admin.d.ts lib/constants/main-contents.ts
git commit -m "refactor: remove post mock configuration"
```

---

### Task 9: Prisma, production build, and runtime smoke verification

**Files:**

- Modify only files proven defective by verification.

**Interfaces:**

- Consumes: the complete feature from Tasks 1–8.
- Produces: verified build and runtime behavior without persistent seed data.

- [ ] **Step 1: Run complete static verification**

Run:

```bash
npx prisma format
npx prisma validate
npx prisma generate
npx tsc --noEmit --incremental false
npm run lint
git diff --check
```

Expected: Prisma schema is valid/client generation succeeds, TypeScript and ESLint exit `0`, and no whitespace errors are reported. Confirm `git diff prisma/schema.prisma` is empty because this feature needs no schema change.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js build exits `0` and its route table includes:

```text
/admin/posts
/admin/posts/create
/admin/posts/[slug]
/admin/posts/[slug]/edit
/api/posts
/api/posts/[slug]
/blog
/blog/[slug]
```

- [ ] **Step 3: Start a fresh production server and smoke-check read paths**

Start on an unused port:

```bash
npm run start -- --port 3001
```

From a separate shell:

```bash
curl -i http://localhost:3001/api/posts
curl -i http://localhost:3001/admin/posts
curl -i http://localhost:3001/admin/posts/create
curl -i http://localhost:3001/blog
curl -i http://localhost:3001/api/posts/not-found-smoke-check
curl -i http://localhost:3001/blog/not-found-smoke-check
```

Expected: list/admin/create/Blog return `200`; both missing detail URLs return `404`.

- [ ] **Step 4: Smoke-check validation without creating persistent data**

Run:

```bash
curl -i -X POST http://localhost:3001/api/posts \
  -H 'Content-Type: application/json' \
  --data '{}'
```

Expected: `422` with field errors.

Send a complete payload using a guaranteed-missing Tag slug:

```json
{
  "title": "Post smoke check",
  "slug": "post-smoke-check",
  "date": "2026-07-23",
  "thumbnail": "/profile.webp",
  "excerpt": "Smoke validation only.",
  "published": false,
  "tagSlugs": ["missing-tag-smoke-check"],
  "body": "<p>This body validates.</p>"
}
```

Expected: `422` containing only the missing `tagSlugs` relation error after scalar validation. This proves Tags, sanitation, and optional defaults without inserting a Post.

- [ ] **Step 5: Verify published filtering when database data permits**

If existing Post records are present, confirm:

- admin API returns draft and published records;
- `/blog` contains published titles only;
- `/blog/[published-slug]` returns `200`;
- `/blog/[draft-slug]` returns `404`;
- displayed read time equals `max(1, ceil(wordCount / 200))`.

If the database has no Posts, record that publication filtering could not be data-smoked; do not seed permanent data solely for verification.

- [ ] **Step 6: Check migration and repository state**

Stop the server, then run:

```bash
npx prisma migrate status
git status --short
git log -10 --oneline
```

Expected: migrations are up to date and only verification-proven fixes, if any, remain uncommitted. If verification required a correction, repeat all relevant checks and commit it with a focused `fix:` message. Do not create an empty verification commit.
