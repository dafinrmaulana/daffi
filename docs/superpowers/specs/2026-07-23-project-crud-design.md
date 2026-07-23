# Project CRUD Design

## Summary

Replace the old Project mock configuration with a real slug-based admin CRUD. The feature follows the accepted Experience architecture: dedicated index/create/detail/edit pages, reusable landing-styled form primitives, sanitized Tiptap HTML, searchable infinite relation selects, full-width index cards, and typed API services. Project-specific UI handles metrics, featured state, thumbnail preview, and portfolio metadata without forcing those concerns into generic CRUD abstractions.

## Goals

- Provide complete Project create, read, update, and delete flows using slug routes.
- Use dedicated pages rather than form modals.
- Reuse the Experience rich-text and infinite-select primitives.
- Select one required Company and multiple optional Tags through real APIs with search and infinite scroll.
- Manage `metrics` through structured label/value rows rather than raw JSON.
- Store `body` as sanitized HTML authored with the existing Tiptap feature set.
- Present Projects as full-width cards and provide a dedicated detail/View page.
- Preserve the existing landing/admin editorial visual language.

## Non-goals

- File upload or media-library infrastructure. Thumbnail remains a URL/path field in this iteration.
- A generic schema-driven CRUD renderer shared by Project and Experience.
- Changes to the public landing-page Project data source.
- New Tiptap extensions beyond those already accepted for Experience.
- Automated tests while the project test suite is intentionally being rebuilt.
- Refactoring the remaining Post mock feature.

## Routes

### Admin pages

- `/admin/projects`: one-column, full-width Project index.
- `/admin/projects/create`: dedicated creation form.
- `/admin/projects/[slug]`: Project detail page.
- `/admin/projects/[slug]/edit`: dedicated edit form.

### API routes

- `GET /api/projects`: paginated and searchable Project index.
- `POST /api/projects`: create a Project and connect relations.
- `GET /api/projects/[slug]`: retrieve one Project with Company and Tags.
- `PATCH /api/projects/[slug]`: update a Project and replace relation selections.
- `DELETE /api/projects/[slug]`: delete a Project.

All public routing and mutations use the Project slug. Numeric IDs remain internal to Prisma.

## Data model and input contract

The current Prisma Project model already represents the accepted feature and requires no schema migration. The form and API contract contains:

- `title`: required string.
- `slug`: optional input that is normalized and required after fallback generation.
- `companySlug`: required Company relation slug.
- `role`: required string.
- `year`: required integer.
- `demoUrl`: optional URL.
- `thumbnail`: required URL or site-relative path.
- `metric`: optional headline outcome used on cards.
- `excerpt`: required plain-text summary.
- `featured`: required boolean with a false default.
- `tagSlugs`: optional unique array of Tag relation slugs.
- `body`: required sanitized HTML.
- `metrics`: optional array of `{ label: string, value: string }` entries stored in the Prisma JSON field.

The slug appears after Title in the form and is generated from Title until the user manually edits it. Once manually edited, subsequent Title changes do not overwrite it. The backend always normalizes and validates the final slug.

`metric` and `metrics` serve different purposes. `metric` is a single concise headline such as “40% faster workflow” for the card. `metrics` is a structured collection displayed on the detail page.

## Architecture and reuse boundary

Project reuses stable primitives and patterns from Experience:

- `RichTextEditor` and `RichTextContent`;
- `InfiniteSelect`;
- `Input`, Button, Badge, Alert, AdminPageHeader, EmptyContent, and ConfirmDialog;
- slug-based API, Axios service, TanStack Query, and dedicated-page patterns.

Project keeps domain-specific units:

- `ProjectForm`;
- `ProjectMetricsFields`;
- `ProjectCard`;
- `ProjectDetail`;
- Project schemas, DTOs, API routes, and services.

This avoids duplicating primitives while preventing Project-only fields from adding conditionals to Experience components. A reusable landing-styled `Checkbox` is added under `components/form/` because Featured is a common form primitive rather than Project domain logic.

## Rich-text body

Project Body uses the existing controlled Tiptap editor with:

- paragraph;
- H2 and H3;
- bold, italic, and underline;
- bullet and ordered lists;
- blockquote;
- link;
- undo and redo.

The API sanitizes Body with the same allowlist and safe-link rules used by Experience. Empty markup such as `<p></p>` fails required validation after plain-text extraction. Cards never render Body HTML; only the detail page uses `RichTextContent`. Excerpt remains plain text for predictable cards and metadata.

## Relation selects

- Company uses required single-select and `useGetInfiniteCompanies`, which already exists.
- Tags use optional multi-select and a new `useGetInfiniteTags` service.

Both use the endpoint-agnostic `InfiniteSelect`, preserving selected options while search queries change. The Tags service consumes the existing paginated Tags API and maps `slug/name` to relation options. Tag search must be case-insensitive without changing the existing API response shape.

The Project payload sends relation slugs. The backend resolves them, reports missing Company or Tags as field errors, and uses numeric IDs only for Prisma connections.

## Metrics editor

`ProjectMetricsFields` manages an ordered array of label/value rows through React Hook Form's field-array API. It provides:

- Add Metric action;
- editable Label and Value controls;
- remove action per row;
- move-up and move-down controls;
- empty state explaining that metrics are optional.

Completely blank rows are removed during parsing. A partially completed row produces field-level errors. Labels are compared case-insensitively and duplicate labels are rejected. The accepted array order is preserved in the JSON value and on the detail metrics grid.

## Form and form primitives

`ProjectForm` is shared by create and edit pages. Field order is:

1. Title;
2. Slug;
3. Company;
4. Role;
5. Year;
6. Demo URL;
7. Thumbnail URL/path;
8. Headline Metric;
9. Excerpt;
10. Featured;
11. Tags;
12. Metrics;
13. Body.

Short controls use a two-column desktop grid. Excerpt, Metrics, and Body span the full width. The form preserves values after server errors and maps validation failures to the relevant control.

The new reusable Checkbox uses a native checkbox input with a landing-styled visible control, keyboard focus treatment, checked icon, label, description, disabled state, and error message.

Thumbnail remains a string field but displays a non-authoritative preview. A failed preview shows a neutral preview-unavailable state and never clears the form value. Keeping preview logic isolated makes a later upload component substitution possible without changing the API contract during this iteration.

## Index and detail presentation

The index renders one full-width card per row. Each card contains:

- landscape thumbnail;
- Company eyebrow and Project title;
- role and year;
- Excerpt;
- optional headline Metric;
- Featured status;
- Tag badges;
- View, Edit, and Delete actions.

The card uses responsive stacking on small screens and a horizontal layout on wider screens.

The detail page contains:

- hero thumbnail;
- Company, title, role, and year;
- Featured status and Tag badges;
- optional external Demo action;
- optional headline Metric;
- ordered metrics grid;
- Excerpt;
- complete sanitized Body HTML;
- Back, Edit, and Delete actions.

Create redirects to the new detail slug. Edit redirects to the returned slug so manual slug changes do not leave the user on a stale route.

## Validation and error handling

Backend validation enforces:

- unique normalized slug;
- existing required Company;
- existence of every unique Tag slug;
- integer Year between 1900 and the current calendar year plus one;
- valid optional Demo URL using `http` or `https`;
- required Thumbnail using `http`, `https`, or a site-relative `/path`;
- bounded Title, Role, Metric, Excerpt, and URL/path lengths;
- complete, uniquely labelled Metrics rows;
- non-empty sanitized Body text.

Create and update write Project scalar fields and Tag connections atomically. Known validation and relation failures return HTTP 422 with field errors, missing Project returns 404, duplicate slug races map to the Slug field, and unexpected errors return a generic 500 response while details remain in server logs.

The index and detail routes provide loading, empty, not-found, and failure states. Deletes use ConfirmDialog and surface success/failure through Alert. Buttons prevent duplicate submissions.

## Cleanup

Remove only the Project entry and Project-only Company mock options from `complex-entities.ts`. Update `ComplexEntityKind` to leave only `posts`. Do not alter Post mock fields or records.

## Verification

No automated tests are added or run during this refactor. Verification consists of:

- Prisma format, validation, and client generation;
- TypeScript checking;
- ESLint;
- production build;
- API smoke checks for list, missing slug, validation failures, and relation search;
- manual Project create, detail, edit including slug change, and delete;
- manual Company/Tag search, pagination, keyboard selection, clear/remove behavior, and empty/error states;
- manual Metrics add/remove/reorder and duplicate/partial-row validation;
- manual Tiptap formatting and sanitized HTML behavior;
- responsive and light/dark visual checks for card, form, checkbox, thumbnail preview, dropdown, metrics, and detail.

## Accepted decisions

- Reuse stable Experience primitives while keeping Project domain components specific.
- Use URL/path for Thumbnail now; file upload is deferred.
- Keep both headline `metric` and structured `metrics`.
- Use the existing Tiptap feature set for Body and plain text for Excerpt.
- Company is required single-select; Tags are optional multi-select.
- Metrics use an ordered key-value repeater and remain stored as JSON.
- Project forms use dedicated routes, and the index uses full-width cards.
