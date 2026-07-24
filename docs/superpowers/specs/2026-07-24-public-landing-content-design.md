# Public Landing Content Design

## Goal

Replace the remaining hard-coded portfolio content with content managed
through the Admin CRUD interface.

Public-facing content includes:

- Projects;
- Experiences;
- Skills;
- published Posts.

Companies, Tags, and Project Highlights appear only through their content
relations. Users, Sessions, and other authentication data are never public.

## Visibility Rules

- Every Project is visible on `/work`.
- At most three Projects with `featured = true` appear on the homepage.
- Every Experience is visible on `/about`.
- The homepage shows at most the three most recent Experiences.
- Every Skill appears in the homepage ticker and on `/about`.
- Only Posts with `published = true` appear on `/blog`, Post detail pages,
  and the public API.

No new `published` field is added to Projects or Experiences.

## Architecture

Public query logic is centralized in server-only data modules. These modules
select only fields needed by the landing pages, apply visibility and ordering
rules, serialize database-specific values, and return public DTOs.

Both the landing Server Components and the public API consume the same query
modules. Landing pages do not make HTTP calls back into their own deployment.
This preserves server rendering and SEO while keeping API responses and page
content governed by the same rules.

The existing Admin APIs remain protected and unchanged:

```text
/api/projects
/api/experiences
/api/skills
/api/posts
```

New read-only routes are public:

```text
/api/public/projects
/api/public/projects/[slug]
/api/public/experiences
/api/public/skills
/api/public/posts
/api/public/posts/[slug]
```

Only `GET` handlers exist below `/api/public`. The proxy does not treat these
routes as authenticated Admin APIs.

## Public API Contract

Collection endpoints accept `page` and `limit`. Defaults are `page=1` and
`limit=10`; invalid values normalize safely, and `limit` is capped at `100`.

Collections use the existing canonical response shape:

```ts
type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};
```

Detail endpoints return `{ data }` and address content by slug. A missing or
non-public record returns `404`. Unexpected database failures return a generic
`500` response and are logged server-side.

Public DTOs exclude numeric IDs and administrative timestamps unless a
timestamp directly supports public presentation. Passwords, session data, and
authentication records are never selected.

## Ordering and Query Behavior

- Projects: featured first, then year descending, then creation date
  descending.
- Homepage Projects: the first three featured Projects under the same order.
- Experiences: start date descending, then creation date descending.
- Homepage Experiences: the first three under the same order.
- Skills: name ascending.
- Posts: date descending, then creation date descending, always filtered to
  `published = true`.

Public API pagination does not add pagination controls to the landing UI in
this iteration. `/work`, `/blog`, and `/about` retain their current all-items
presentation, while homepage previews remain explicitly limited.

## Landing Integration

### Homepage

- `SkillsTicker` receives all Skills through props.
- `WorkPreview` receives up to three featured Projects through props.
- `ExperienceSection` receives up to three Experiences through props.
- A homepage data section is omitted when its collection is empty. Index pages
  retain explicit empty states.

### Work

`/work` displays every Project using database-backed Project cards. Cards link
to `/work/[slug]` instead of opening the external demo URL directly.

`/work/[slug]` is a new internal detail page containing:

- thumbnail;
- title, company, role, and year;
- Tags;
- excerpt;
- sanitized rich-text body;
- optional metrics;
- an external demo button when `demoUrl` is present.

The page generates metadata from the Project title, excerpt, thumbnail, and
Tags. A missing slug uses Next.js `notFound()`.

Project thumbnails may be arbitrary URLs entered through Admin. Public
components use the existing safe plain-image pattern instead of depending on a
fixed Next Image remote-host allowlist.

### About

`/about` receives all Experiences and Skills from the database. Experience
descriptions render through the existing sanitized rich-text renderer.
Companies, Project Highlights, and Skills are displayed as Experience
relations rather than independent public indexes.

### Blog

`/blog` and `/blog/[slug]` retain their current presentation and published-only
behavior. Their queries move into the shared public content data layer so the
pages and `/api/public/posts*` use the same rules.

## Component Boundaries

Landing components remain presentational:

- pages load data;
- public query modules own database access and serialization;
- route handlers own HTTP parsing and responses;
- cards, tickers, and sections receive typed public DTOs through props.

Existing landing components are adapted where their visual structure still
fits. The Admin card and form components are not reused because they include
management actions and Admin-specific behavior.

Shared pagination parsing and metadata construction are extracted only when
doing so removes real duplication among public endpoints.

## Static Content Removal

The dynamic Projects, Experiences, and Skills arrays in
`lib/constants/main-contents.ts` are removed after every consumer has migrated.
Their old values are not used as runtime fallback data.

Static biography copy, headings, navigation, and other editorial UI text remain
in their current components because they are outside the Admin CRUD scope.

When a collection is empty, the page or section shows an intentional empty
state rather than restoring hard-coded content.

## Error Handling

- Empty database results are treated as valid content states.
- Database failures are not converted into empty results.
- Public API failures use generic client-safe error messages.
- Landing rendering failures use a landing-styled error boundary.
- Project and published Post detail pages distinguish missing content with
  `notFound()`.
- Rich HTML is rendered only with the existing rich-text presentation
  component. Content continues to be sanitized on Admin writes.

## Verification

No automated tests are added or run during the current large refactor, following
the established project decision.

Verification consists of:

- auditing for remaining imports from `main-contents.ts`;
- auditing public DTOs and API responses for internal IDs or authentication
  data;
- TypeScript compilation;
- ESLint;
- Prisma schema validation;
- production build;
- `git diff --check`;
- manual smoke checks for homepage content, `/work`, `/work/[slug]`, `/about`,
  `/blog`, `/blog/[slug]`, public collection pagination, public detail `404`
  behavior, empty states, and unauthenticated public API access;
- confirming Admin APIs remain inaccessible without authentication.

## Out of Scope

This iteration does not add:

- public search, filters, or sorting controls;
- landing pagination controls;
- public index pages for Companies, Tags, or Project Highlights;
- public User data;
- draft states for Projects or Experiences;
- image file uploads;
- Admin content preview workflows;
- caching or revalidation policy beyond the existing Next.js behavior.
