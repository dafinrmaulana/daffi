# Post CRUD and Public Blog Design

## Summary

Replace the remaining mock Post admin with a real slug-based CRUD and connect Posts to new public Blog index and detail pages. The feature follows the accepted Experience and Project architecture: dedicated admin pages, full-width cards, reusable landing-styled primitives, sanitized Tiptap HTML, searchable infinite Tag selection, typed API services, and domain-specific components. Public pages read from PostgreSQL and expose only published Posts.

## Goals

- Provide complete Post create, read, update, and delete flows using slug routes.
- Provide public `/blog` and `/blog/[slug]` pages backed by real Post data.
- Use dedicated create and edit pages instead of form modals.
- Reuse the existing Tiptap, infinite-select, form, feedback, and admin primitives.
- Select optional Tags through the existing searchable infinite-scroll flow.
- Generate an editable slug from the Post title.
- Calculate and persist read time automatically from sanitized Body text.
- Keep draft Posts accessible to admin while preventing public access.
- Generate public metadata from the existing Post content fields.
- Remove the old Post mock admin and landing data once the real feature replaces them.

## Non-goals

- File upload or media-library infrastructure. Thumbnail remains a URL/path field.
- Dedicated SEO title, description, canonical, or social-image form fields.
- Scheduled publishing.
- A generic schema-driven CRUD abstraction shared across Experience, Project, and Post.
- New Tiptap extensions beyond the existing accepted rich-text feature set.
- Automated tests while the project test suite is intentionally being rebuilt.

## Routes

### Admin pages

- `/admin/posts`: one-column, full-width Post index.
- `/admin/posts/create`: dedicated creation form.
- `/admin/posts/[slug]`: admin Post detail.
- `/admin/posts/[slug]/edit`: dedicated edit form.

### Public pages

- `/blog`: published Post index ordered by publication date descending.
- `/blog/[slug]`: published Post detail.

### API routes

- `GET /api/posts`: paginated and searchable Post index for admin, including drafts.
- `POST /api/posts`: create a Post.
- `GET /api/posts/[slug]`: retrieve one Post for admin.
- `PATCH /api/posts/[slug]`: update a Post.
- `DELETE /api/posts/[slug]`: delete a Post.

Public server-rendered pages query Prisma through a dedicated server-side data boundary rather than consuming the admin HTTP API. Their queries always include `published: true`. Numeric Post IDs remain internal to Prisma; routes and mutation services use slugs.

## Data model and input contract

The current Prisma `Post` model already contains every accepted field and requires no migration:

- `title`: required string.
- `slug`: optional form input that becomes required after title fallback and normalization.
- `date`: required publication date, defaulting to the current date on create and remaining editable.
- `readTime`: generated integer and never entered manually.
- `thumbnail`: required HTTP/HTTPS URL or site-relative path.
- `excerpt`: required plain-text summary.
- `published`: boolean with a false default.
- `tagSlugs`: optional unique array of Tag relation slugs.
- `body`: required sanitized HTML.

The form field order is:

1. Title.
2. Slug.
3. Date.
4. Thumbnail URL/path.
5. Excerpt.
6. Published.
7. Tags.
8. Body.

Slug is generated from Title until the user manually edits it. Once manually edited, later Title changes do not overwrite it. The backend always normalizes and validates the final slug.

Date is the editorial publication date rather than a scheduling mechanism. It defaults to today and is used for public ordering and display regardless of when the record was created. Draft Posts retain their selected date, and publishing does not silently replace it.

## Read-time calculation

Read time is calculated exclusively by the backend after Body sanitation:

1. Convert sanitized HTML to plain text.
2. Split the text into non-empty whitespace-delimited words.
3. Divide the word count by 200 words per minute.
4. Round upward and enforce a minimum of one minute.

Create always generates `readTime`. Update recalculates it whenever Body changes and preserves the existing value for scalar-only updates. Because the edit form submits a complete Post input, ordinary edits always keep the persisted read time synchronized with the accepted Body. The client never sends or controls `readTime`.

## Architecture and component boundaries

Post reuses stable primitives and patterns from Experience and Project:

- `RichTextEditor` and `RichTextContent`;
- `InfiniteSelect` and `useGetInfiniteTags`;
- `Input`, `Textarea`, `Checkbox`, Button, Badge, Alert, AdminPageHeader, EmptyContent, and ConfirmDialog;
- slug normalization;
- rich-text sanitation and plain-text conversion;
- Axios/TanStack Query admin services;
- dedicated create/detail/edit page flow.

Post retains domain-specific units:

- `PostForm`;
- `AdminPostCard`;
- `AdminPostDetail`;
- public Blog card/article presentation;
- Post schemas, DTOs, API routes, services, and server-side public queries.

This boundary reuses UI behavior without adding Post-specific publication and read-time conditions to Project or Experience components. Existing public `PostCard` may be refactored to accept the real typed Post DTO, provided its public presentation stays isolated from admin actions.

## Rich-text Body

Body uses the existing controlled Tiptap editor with:

- paragraph;
- H2 and H3;
- bold, italic, and underline;
- bullet and ordered lists;
- blockquote;
- link;
- undo and redo.

The API sanitizes Body using the existing allowlist and safe-link rules. Markup without meaningful plain text, such as `<p></p>`, fails required validation. Cards never render Body HTML. Admin and public detail views render accepted content through `RichTextContent`.

## Tag selection

Tags use the existing optional multi-select and `useGetInfiniteTags` service. Selected values are preserved while search changes, and loading, pagination, empty, retry, keyboard, clear, and removal behavior remains owned by `InfiniteSelect`.

The form sends Tag slugs. The backend deduplicates them, resolves all Tags, returns field errors for missing values, and uses numeric IDs only for Prisma connections. Updates replace the complete Tag selection atomically.

## Admin form and thumbnail

`PostForm` is shared by create and edit pages. Short fields use a two-column desktop layout while Excerpt, Tags, and Body span the full width.

Thumbnail remains a string input and includes the same non-authoritative preview behavior as Project. Failed previews display a neutral unavailable state without clearing or invalidating an otherwise structurally valid value. This keeps the form ready for a later upload component without changing the current API.

Published uses the reusable native Checkbox. New Posts default to draft. Submissions preserve values after server errors and map backend validation messages to individual controls.

## Admin index and detail

The admin index renders one full-width responsive card per Post. Each card contains:

- landscape thumbnail;
- publication date;
- title;
- Excerpt;
- generated read time;
- Draft or Published status;
- Tag badges;
- View, Edit, and Delete actions.

The admin detail includes the same metadata, hero thumbnail, complete sanitized Body, Back/Edit/Delete actions, and clear status treatment. Admin queries can retrieve both draft and published Posts.

Create redirects to the new admin detail slug. Edit redirects to the slug returned by the API so manual slug changes do not leave the user on a stale route. Deletes require confirmation and return to or refresh the index as appropriate.

## Public Blog

The public Blog follows the established landing visual language and the accepted one-column full-width card layout.

`/blog`:

- queries only `published: true`;
- orders by `date` descending, then `createdAt` descending for stable ties;
- renders thumbnail, date, read time, title, Excerpt, and Tags;
- links each card to `/blog/[slug]`;
- provides a landing-styled empty state when no published Posts exist.

`/blog/[slug]`:

- resolves only a published slug;
- returns the framework not-found response for drafts or missing Posts;
- renders hero thumbnail, title, date, read time, Tags, Excerpt, and full sanitized Body;
- uses the same responsive typography and borders as existing Project and Experience presentation.

Draft content is never included in public page queries, static metadata generation, or public related-content lookups.

## SEO metadata

Public Post detail metadata is generated from existing fields:

- metadata title from `title`;
- description from `excerpt`;
- Open Graph and Twitter image from `thumbnail`;
- canonical URL from `/blog/[slug]`;
- article published time from `date`;
- Tag names as article keywords where supported.

The Blog index receives stable Blog metadata. Missing or draft slugs return not-found behavior and do not expose draft metadata. The implementation uses the application's existing metadata-base convention; this feature does not introduce a new site-URL configuration system.

## Validation and error handling

Backend validation enforces:

- non-empty bounded Title, Excerpt, and sanitized Body;
- unique normalized slug;
- a valid Date input;
- required Thumbnail using HTTP, HTTPS, or a site-relative `/path`;
- unique submitted Tag slugs and existence of every Tag;
- boolean Published state;
- automatic read time derived from Body.

Create and update write scalar values and Tag relations atomically. Known field and relation failures return HTTP 422, a missing admin Post returns 404, duplicate-slug races map to the Slug field, and unexpected failures return a generic 500 while details remain in server logs.

Admin index and detail provide loading, empty, not-found, and failure states. Buttons prevent duplicate submissions. Delete uses `ConfirmDialog` and surfaces success or failure through `Alert`.

Public pages use server-rendered not-found and empty states. They do not expose internal API error detail or draft existence.

## Mock cleanup

Remove the remaining Post configuration from `lib/constants/complex-entities.ts`. If this leaves `complexEntityConfigs`, `ComplexEntityKind`, or their schema-driven components unused, remove only the now-dead mock CRUD surface after confirming there are no consumers.

Remove Post fixtures and their fixture-only type/helper from `lib/constants/main-contents.ts` after public Blog pages use real database data. Preserve unrelated Project, Experience, skill, testimonial, and landing content.

## Verification

No automated tests are added or run during this refactor. Verification consists of:

- Prisma format, validation, and client generation;
- TypeScript checking;
- ESLint;
- production build;
- API smoke checks for list, create validation, missing slug, duplicate slug, Tag validation, update, and delete;
- confirmation that read time is generated and recalculated from Body;
- confirmation that draft Posts are available in admin and inaccessible publicly;
- manual admin create, detail, edit including slug change, publish/unpublish, and delete;
- manual Tag search, pagination, keyboard selection, clear/remove, and error states;
- manual Tiptap formatting and sanitized HTML behavior;
- public Blog index/detail, ordering, not-found, and dynamic metadata checks;
- responsive and light/dark visual checks for admin cards/forms/details and public cards/articles.

## Accepted decisions

- Build real admin CRUD and the public Blog in the same feature.
- Follow the Experience and Project architecture instead of extending the generic mock CRUD.
- Use dedicated admin routes and full-width, one-column cards.
- Use URL/path for Thumbnail; file upload remains deferred.
- Use the existing Tiptap feature set and sanitized HTML storage.
- Use optional Tags through the existing infinite multi-select.
- Calculate read time exclusively in the backend at 200 words per minute with a one-minute minimum.
- Default Date to today while keeping it editable; do not implement scheduling.
- Expose only published Posts publicly.
- Derive SEO metadata from Title, Excerpt, Thumbnail, Date, Tags, and slug.
- Keep automated tests deferred during the current large refactor.
