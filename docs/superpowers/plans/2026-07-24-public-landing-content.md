# Public Landing Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hard-coded Projects, Experiences, and Skills on the public site with Admin-managed database content, expose safe read-only public APIs, and add an internal Project detail page.

**Architecture:** Server-only public data modules own Prisma selection, visibility, ordering, pagination, and serialization. Landing Server Components and thin `/api/public/*` GET handlers share those modules, while presentational landing components receive public DTOs through props. Existing authenticated Admin APIs remain unchanged.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components, TypeScript, Prisma 7, PostgreSQL, Tailwind CSS, Zod-compatible request normalization.

## Global Constraints

- Public content is Projects, Experiences, Skills, and published Posts.
- Companies, Tags, and Project Highlights are exposed only as selected relations.
- Users, numeric database IDs, passwords, Sessions, and authentication data are never public.
- Every Project is public; only up to three featured Projects appear on the homepage.
- Every Experience appears on `/about`; only the three most recent appear on the homepage.
- Every Skill appears in the homepage ticker and on `/about`.
- Only Posts with `published = true` are public.
- Public collection APIs normalize `page`, default it to `1`, normalize `limit`, default it to `10`, and cap it at `100`.
- Landing indexes continue showing all items and do not add pagination controls.
- Public Project cards link to `/work/[slug]`; optional `demoUrl` appears on the detail page.
- Dynamic arrays in `lib/constants/main-contents.ts` are removed without runtime fallbacks.
- No automated tests are added or run during this refactor. Use static analysis, production build, API smoke checks, and manual page checks.

---

### Task 1: Public DTOs and Pagination Foundation

**Files:**
- Create: `types/public-content.d.ts`
- Create: `lib/data/public-pagination.ts`

**Interfaces:**
- Produces: `PublicProject`, `PublicExperience`, `PublicSkill`, `PublicPost`, `PublicCompany`, `PublicTag`, `PublicProjectHighlight`, and `PublicListInput`.
- Produces: `getPublicPagination(searchParams: URLSearchParams): { page: number; limit: number; skip: number }`.
- Produces: `createPaginationMeta(page: number, limit: number, total: number): MetaPagination`.

- [ ] **Step 1: Define public content DTOs**

Create `types/public-content.d.ts` with public-only shapes:

```ts
import type { ProjectMetric } from "@/types/project";

export type PublicCompany = {
  slug: string;
  name: string;
  companyLogo: string | null;
};

export type PublicTag = {
  slug: string;
  name: string;
};

export type PublicProjectHighlight = {
  slug: string;
  name: string;
  description: string | null;
};

export type PublicProject = {
  slug: string;
  title: string;
  company: PublicCompany;
  role: string;
  year: number;
  demoUrl: string | null;
  thumbnail: string;
  metric: string | null;
  excerpt: string;
  featured: boolean;
  tags: PublicTag[];
  body: string;
  metrics: ProjectMetric[];
};

export type PublicExperience = {
  slug: string;
  company: PublicCompany;
  role: string;
  startDate: string;
  endDate: string | null;
  location: string;
  description: string;
  projectHighlight: PublicProjectHighlight | null;
  skills: PublicSkill[];
};

export type PublicSkill = {
  slug: string;
  name: string;
  description: string | null;
};

export type PublicPost = {
  slug: string;
  title: string;
  date: string;
  readTime: number | null;
  thumbnail: string;
  excerpt: string;
  tags: PublicTag[];
  body: string;
};

export type PublicListInput = {
  page?: number;
  limit?: number;
};
```

- [ ] **Step 2: Add canonical public pagination helpers**

Create `lib/data/public-pagination.ts`:

```ts
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function toPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getPublicPagination(searchParams: URLSearchParams) {
  const page = toPositiveInteger(searchParams.get("page"), DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    toPositiveInteger(searchParams.get("limit"), DEFAULT_LIMIT),
  );

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
```

- [ ] **Step 3: Verify the foundation**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint types/public-content.d.ts lib/data/public-pagination.ts
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 4: Commit**

```bash
git add types/public-content.d.ts lib/data/public-pagination.ts
git commit -m "feat: add public content contracts"
```

---

### Task 2: Public Project Data and API

**Files:**
- Create: `lib/data/public-projects.ts`
- Create: `app/api/public/projects/route.ts`
- Create: `app/api/public/projects/[slug]/route.ts`

**Interfaces:**
- Consumes: `PublicProject`, `PublicListInput`, `getPublicPagination`, and `createPaginationMeta`.
- Produces: `listPublicProjects(input: Required<PublicListInput>): Promise<PaginatedResponse<PublicProject>>`.
- Produces: `getAllPublicProjects(): Promise<PublicProject[]>`.
- Produces: `getFeaturedPublicProjects(limit?: number): Promise<PublicProject[]>`.
- Produces: `getPublicProject(slug: string): Promise<PublicProject | null>`.

- [ ] **Step 1: Implement the Project public query module**

Create a server-only module with an explicit Prisma selection:

```ts
import "server-only";

import { parseProjectMetrics } from "@/lib/project";
import prisma from "@/lib/providers/prisma";
import type { Prisma } from "@/prisma/generated/prisma/client";
import type { PublicListInput, PublicProject } from "@/types/public-content";
import { createPaginationMeta } from "@/lib/data/public-pagination";

const publicProjectSelect = {
  slug: true,
  title: true,
  role: true,
  year: true,
  demoUrl: true,
  thumbnail: true,
  metric: true,
  excerpt: true,
  featured: true,
  body: true,
  metrics: true,
  company: {
    select: { slug: true, name: true, companyLogo: true },
  },
  tags: {
    orderBy: { name: "asc" as const },
    select: { slug: true, name: true },
  },
} satisfies Prisma.ProjectSelect;

const projectOrder = [
  { featured: "desc" as const },
  { year: "desc" as const },
  { createdAt: "desc" as const },
];

type SelectedProject = Prisma.ProjectGetPayload<{
  select: typeof publicProjectSelect;
}>;

function serializePublicProject(project: SelectedProject): PublicProject {
  return { ...project, metrics: parseProjectMetrics(project.metrics) };
}
```

Implement the four exported functions using `publicProjectSelect` and
`projectOrder`. `listPublicProjects` applies `skip`/`take` and returns canonical
metadata. `getFeaturedPublicProjects` adds `where: { featured: true }`.
`getPublicProject` uses `findUnique({ where: { slug } })`.

- [ ] **Step 2: Add public Project collection route**

Create `app/api/public/projects/route.ts` with a `GET(request: Request)` handler.
Parse pagination with `new URL(request.url).searchParams`, call
`listPublicProjects`, return JSON, and on failure log
`"Failed to list public projects"` before returning
`{ message: "Internal server error" }` with status `500`.

- [ ] **Step 3: Add public Project detail route**

Create `app/api/public/projects/[slug]/route.ts` using
`RouteContext<{ slug: string }>`. Decode the slug, call `getPublicProject`, return
`{ data }`, and return `{ message: "Project not found" }` with status `404`
when absent. Unexpected failures return the generic `500` response.

- [ ] **Step 4: Verify Project data and routes**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint lib/data/public-projects.ts app/api/public/projects/route.ts 'app/api/public/projects/[slug]/route.ts'
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 5: Commit**

```bash
git add lib/data/public-projects.ts app/api/public/projects
git commit -m "feat: expose public projects"
```

---

### Task 3: Public Experience and Skill Data and APIs

**Files:**
- Create: `lib/data/public-experiences.ts`
- Create: `lib/data/public-skills.ts`
- Create: `app/api/public/experiences/route.ts`
- Create: `app/api/public/skills/route.ts`

**Interfaces:**
- Produces: `listPublicExperiences`, `getAllPublicExperiences`, and `getRecentPublicExperiences`.
- Produces: `listPublicSkills` and `getAllPublicSkills`.
- All list functions return public DTOs without numeric IDs or timestamps.

- [ ] **Step 1: Implement public Experience queries**

Use this explicit selection in `lib/data/public-experiences.ts`:

```ts
const publicExperienceSelect = {
  slug: true,
  role: true,
  startDate: true,
  endDate: true,
  location: true,
  description: true,
  company: {
    select: { slug: true, name: true, companyLogo: true },
  },
  projectHighlight: {
    select: { slug: true, name: true, description: true },
  },
  skills: {
    orderBy: { name: "asc" as const },
    select: { slug: true, name: true, description: true },
  },
} satisfies Prisma.ExperienceSelect;
```

Serialize `startDate` and `endDate` with `toISOString()`. Order by
`startDate desc`, then `createdAt desc`. Implement paginated, all-items, and
recent-items functions; the recent function defaults to `3`.

- [ ] **Step 2: Implement public Skill queries**

Use `select: { slug: true, name: true, description: true }` and
`orderBy: { name: "asc" }` in `lib/data/public-skills.ts`. Implement a
paginated function with canonical metadata and an all-items function.

- [ ] **Step 3: Add Experience and Skill collection routes**

Each route:

1. parses `page` and `limit` with `getPublicPagination`;
2. calls its paginated data function;
3. returns the result with `NextResponse.json`;
4. logs an entity-specific server error;
5. returns generic status `500` JSON on failure.

Neither route imports authorization helpers.

- [ ] **Step 4: Verify Experience and Skill data**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint lib/data/public-experiences.ts lib/data/public-skills.ts app/api/public/experiences/route.ts app/api/public/skills/route.ts
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 5: Commit**

```bash
git add lib/data/public-experiences.ts lib/data/public-skills.ts app/api/public/experiences app/api/public/skills
git commit -m "feat: expose public experience content"
```

---

### Task 4: Consolidate Published Post Data and Add Public Post API

**Files:**
- Create: `lib/data/public-posts.ts`
- Create: `app/api/public/posts/route.ts`
- Create: `app/api/public/posts/[slug]/route.ts`
- Modify: `app/blog/page.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `components/blog/post-card.tsx`
- Modify: `components/blog/post-article.tsx`
- Delete: `lib/data/published-posts.ts`

**Interfaces:**
- Produces: `listPublicPosts`, `getAllPublicPosts`, and `getPublicPost`.
- All functions enforce `where: { published: true }`.
- Blog pages consume `getAllPublicPosts` and `getPublicPost`.

- [ ] **Step 1: Build the published-only Post query module**

Create `lib/data/public-posts.ts` with an explicit public selection:

```ts
const publicPostSelect = {
  slug: true,
  title: true,
  date: true,
  readTime: true,
  thumbnail: true,
  excerpt: true,
  body: true,
  tags: {
    orderBy: { name: "asc" as const },
    select: { slug: true, name: true },
  },
} satisfies Prisma.PostSelect;
```

Serialize `date` with `toISOString()`. Every query includes
`where: { published: true }` and orders by date descending, then creation date
descending. The detail function uses `findFirst({ where: { slug, published:
true } })`.

- [ ] **Step 2: Add public Post collection and detail routes**

Implement the same collection contract and detail `404` contract as Projects.
The detail `404` message is `"Post not found"`. No draft Post may be returned.

- [ ] **Step 3: Migrate Blog pages**

In `app/blog/page.tsx`, replace `getPublishedPosts` with
`getAllPublicPosts`. In `app/blog/[slug]/page.tsx`, keep the React `cache`
wrapper but replace `getPublishedPost` with `getPublicPost`. Preserve existing
metadata, canonical URL, Tags, Open Graph, Twitter card, and `notFound()`
behavior.

Change `PostCard` and `PostArticle` to accept `PublicPost` instead of
`PostWithRelations`. Their rendered fields already exist on the public DTO, so
their markup remains unchanged.

- [ ] **Step 4: Remove the superseded module**

Confirm no imports remain:

```bash
rg -n 'published-posts|getPublishedPosts|getPublishedPost' app components lib
```

Expected: no output. Then delete `lib/data/published-posts.ts`.

- [ ] **Step 5: Verify Post consolidation**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint lib/data/public-posts.ts app/api/public/posts/route.ts 'app/api/public/posts/[slug]/route.ts' app/blog/page.tsx 'app/blog/[slug]/page.tsx' components/blog/post-card.tsx components/blog/post-article.tsx
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 6: Commit**

```bash
git add lib/data/public-posts.ts app/api/public/posts app/blog components/blog lib/data/published-posts.ts
git commit -m "feat: expose published posts publicly"
```

---

### Task 5: Connect Homepage and About to Public Content

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `components/home/skills-ticker.tsx`
- Modify: `components/home/work-preview.tsx`
- Modify: `components/shared/experience-section.tsx`
- Modify: `components/work/project-card.tsx`

**Interfaces:**
- Consumes: all-items/recent/featured public data functions.
- Components consume typed DTO arrays and do not import Prisma or data modules.

- [ ] **Step 1: Adapt the public Project card**

Replace the static Project type with `PublicProject`. Link to
`/work/${project.slug}` and use `project.slug` as identity. Replace static field
names with `company.name`, numeric `year`, `tags[].name`, and nullable
`metric`. Use a plain `<img>` with the existing ESLint suppression so arbitrary
Admin-entered URLs work without a remote-host allowlist. Preserve the current
card grid, hover behavior, Badges, and index label.

- [ ] **Step 2: Make data-driven landing components presentational**

Change component signatures to:

```ts
export function SkillsTicker({ skills }: { skills: PublicSkill[] })

export function WorkPreview({ projects }: { projects: PublicProject[] })

export function ExperienceSection({
  experiences,
}: {
  experiences: PublicExperience[];
})
```

`SkillsTicker` renders `skill.name`. `WorkPreview` maps the supplied Projects
without filtering internally. `ExperienceSection`:

- uses `experience.slug` as key;
- formats dates with `formatExperiencePeriod`;
- renders `experience.description` through `RichTextContent`;
- shows company and optional Project Highlight;
- maps related Skills into Badges.

Each component returns `null` when its array is empty, implementing the
homepage omission rule.

- [ ] **Step 3: Load homepage data concurrently**

Make `HomePage` async and use:

```ts
const [skills, projects, experiences] = await Promise.all([
  getAllPublicSkills(),
  getFeaturedPublicProjects(3),
  getRecentPublicExperiences(3),
]);
```

Pass the arrays to the corresponding components. Keep Hero, About copy, and
Contact CTA unchanged.

- [ ] **Step 4: Load About data concurrently**

Make `/about` fetch all Skills and Experiences with `Promise.all`. Render Skill
names as Badges and pass Experiences to `ExperienceSection`. When Skills are
empty, render a bordered `"No Skills have been published yet."` empty state.
When Experiences are empty, `ExperienceSection` returns `null`.

- [ ] **Step 5: Verify homepage and About integration**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint app/page.tsx app/about/page.tsx components/home/skills-ticker.tsx components/home/work-preview.tsx components/shared/experience-section.tsx components/work/project-card.tsx
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/about/page.tsx components/home/skills-ticker.tsx components/home/work-preview.tsx components/shared/experience-section.tsx components/work/project-card.tsx
git commit -m "feat: render managed landing content"
```

---

### Task 6: Build Public Work Index and Project Detail

**Files:**
- Modify: `app/work/page.tsx`
- Create: `app/work/[slug]/page.tsx`
- Create: `components/work/project-article.tsx`

**Interfaces:**
- Work index consumes `getAllPublicProjects`.
- Work detail consumes cached `getPublicProject`.
- Project cards consume `PublicProject` and link by slug.

- [ ] **Step 1: Load the Work index from the database**

Make `/work` async, call `getAllPublicProjects()`, and render cards. When the
array is empty, render the established bordered empty state:

```tsx
<div className="border border-border p-8 sm:p-10">
  <p className="font-serif text-3xl">No Projects yet.</p>
  <p className="mt-3 text-muted">
    New work will appear here once it is ready.
  </p>
</div>
```

- [ ] **Step 2: Create the Project article**

`ProjectArticle` receives one `PublicProject` and renders:

- a Back to Work button;
- responsive thumbnail;
- title and excerpt;
- company, role, and year;
- Tag Badges;
- optional primary demo button with `target="_blank"` and
  `rel="noreferrer"`;
- optional metric summary;
- metric cards only when `metrics.length > 0`;
- body through `RichTextContent`.

Use the existing monochrome borders, serif headings, mono metadata labels, and
spacing conventions from `PostArticle` and the Admin Project detail.

- [ ] **Step 3: Create `/work/[slug]` with metadata**

Wrap `getPublicProject` in React `cache`, call `notFound()` when absent, and
generate:

```ts
return {
  title: project.title,
  description: project.excerpt,
  alternates: { canonical: `/work/${project.slug}` },
  keywords: project.tags.map((tag) => tag.name),
  openGraph: {
    title: project.title,
    description: project.excerpt,
    images: [{ url: project.thumbnail, alt: project.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: project.title,
    description: project.excerpt,
    images: [project.thumbnail],
  },
};
```

Render `ProjectArticle` inside `Section`.

- [ ] **Step 4: Verify Work pages**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint app/work/page.tsx 'app/work/[slug]/page.tsx' components/work/project-card.tsx components/work/project-article.tsx
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 5: Commit**

```bash
git add app/work components/work
git commit -m "feat: add managed project showcase"
```

---

### Task 7: Remove Static Dynamic Content and Add Landing Error UI

**Files:**
- Delete: `lib/constants/main-contents.ts`
- Create: `app/error.tsx`
- Modify only if reported by audit: remaining files importing `main-contents.ts`

**Interfaces:**
- No runtime code imports static Projects, Experiences, or Skills.
- Produces a client error boundary compatible with the public Site Chrome.

- [ ] **Step 1: Audit and remove static content imports**

Run:

```bash
rg -n 'main-contents|\\bprojects\\b|\\bexperiences\\b|\\bskills\\b' app components lib/constants --glob '*.{ts,tsx}'
```

Every `main-contents` import must already be replaced by Tasks 5 and 6. Delete
`lib/constants/main-contents.ts`. Do not remove unrelated static biography,
heading, navigation, or social-link copy.

- [ ] **Step 2: Add a landing-styled error boundary**

Create `app/error.tsx` as a Client Component accepting
`{ error: Error & { digest?: string }; reset: () => void }`. Log the error in
`useEffect`, render a `Section`, a mono `"Something went wrong"` eyebrow, a
serif error heading, a short retry message, and an existing `Button` calling
`reset`.

- [ ] **Step 3: Audit public exposure boundaries**

Run:

```bash
rg -n '\\bid\\b|password|session|createdAt|updatedAt' types/public-content.d.ts lib/data/public-*.ts app/api/public
```

Expected: no selected numeric IDs, password fields, session data, or
administrative timestamps in public DTOs. Prisma ordering by `createdAt` is
allowed because it does not select or serialize that field.

- [ ] **Step 4: Verify static content removal**

Run:

```bash
rg -n 'main-contents' app components lib types || true
npx tsc --noEmit --incremental false
npx eslint app/error.tsx app components lib types
git diff --check
```

Expected: the first command prints nothing; all verification commands exit
`0`.

- [ ] **Step 5: Commit**

```bash
git add app/error.tsx app components lib types
git commit -m "refactor: remove static portfolio content"
```

---

### Task 8: Full Verification and Public API Smoke Check

**Files:**
- Modify only if verification exposes a defect in files already in scope.

**Interfaces:**
- Confirms public content is unauthenticated and Admin APIs remain protected.

- [ ] **Step 1: Run full static verification**

Run:

```bash
npx prisma validate
npx tsc --noEmit --incremental false
npm run lint
git diff --check
```

Expected: Prisma reports a valid schema; TypeScript, ESLint, and diff check exit
`0`.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: the Next.js production build completes successfully. Existing
`metadataBase` warnings may remain; no compilation or prerender error is
accepted. Restore a build-only `next-env.d.ts` path rewrite if Next.js changes
that generated reference.

- [ ] **Step 3: Start the app and smoke-check routes**

Start the app on an available local port, then check:

```bash
curl -i 'http://127.0.0.1:3101/api/public/projects?page=1&limit=10'
curl -i 'http://127.0.0.1:3101/api/public/experiences?page=1&limit=10'
curl -i 'http://127.0.0.1:3101/api/public/skills?page=1&limit=10'
curl -i 'http://127.0.0.1:3101/api/public/posts?page=1&limit=10'
curl -i 'http://127.0.0.1:3101/api/projects?page=1&limit=10'
curl -I 'http://127.0.0.1:3101/'
curl -I 'http://127.0.0.1:3101/work'
curl -I 'http://127.0.0.1:3101/about'
curl -I 'http://127.0.0.1:3101/blog'
```

Expected:

- public API collections return `200` without a session;
- every public response uses `{ data, meta }`;
- `/api/projects` returns `401` without a session;
- public pages return `200`;
- a nonexistent public Project/Post detail returns `404`;
- existing data renders from the database with relations and no numeric IDs.

- [ ] **Step 4: Perform final audits**

Run:

```bash
rg -n 'main-contents|published-posts' app components lib types || true
git status --short
git log --oneline -10
```

Expected: no legacy data imports; worktree is clean after any verification fix
commit; recent commits correspond to the tasks above.

- [ ] **Step 5: Commit verification fixes when needed**

If verification required changes:

```bash
git add app components lib types
git commit -m "fix: complete public landing integration"
```

If no files changed, do not create an empty commit.
