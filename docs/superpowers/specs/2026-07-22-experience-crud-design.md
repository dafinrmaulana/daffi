# Experience CRUD Design

## Summary

Build the real admin Experience feature and replace its old mock configuration. Experience uses slug-based public identity, separate index/create/detail/edit pages, a Tiptap HTML description editor, and reusable API-backed relation selects with search and infinite scrolling. The interface follows the existing monochrome editorial style used by the landing page and admin UI.

## Goals

- Provide complete Experience create, read, update, and delete flows.
- Keep create and edit forms on dedicated pages rather than in modals.
- Add a dedicated Experience detail page and a View action on the index.
- Store the description as sanitized HTML authored through Tiptap.
- Load Company, Project Highlight, and Skill choices from their existing APIs with search and infinite pagination.
- Provide one reusable relation-select UI that supports both single and multiple selection.
- Use a one-column, full-width card layout for the Experience index.

## Non-goals

- Images, tables, code blocks, embeds, collaboration, or file uploads in the editor.
- A generic all-resources relation-options API.
- Replacing the static public landing-page experience content in this iteration.
- Adding automated tests while the project's test suite is intentionally being rebuilt.
- Refactoring unrelated CRUD modules.

## Routes

### Admin pages

- `/admin/experiences`: full-width, one-column Experience index.
- `/admin/experiences/create`: dedicated creation form.
- `/admin/experiences/[slug]`: Experience detail page.
- `/admin/experiences/[slug]/edit`: dedicated edit form.

### API routes

- `GET /api/experiences`: paginated and searchable index.
- `POST /api/experiences`: create an Experience.
- `GET /api/experiences/[slug]`: fetch one Experience and its relations.
- `PATCH /api/experiences/[slug]`: update an Experience and its relations.
- `DELETE /api/experiences/[slug]`: delete an Experience.

The existing Company, Project Highlight, and Skill index APIs remain the sources for relation options. They already expose page, limit, and search query parameters.

## Data model

The Prisma `Experience` model retains its numeric ID for internal database relations, while all public routes and client mutations identify records by `slug`.

Required changes:

- Correct the misspelled relation field `higlight` to `projectHighlight`.
- Change `projectHighlight` and `projectHighlightId` to optional fields.
- Retain a required Company relation.
- Retain the many-to-many Skill relation.
- Keep `description` as database text containing sanitized HTML.

The preferred schema field order is ID, Company relation fields, role, slug, dates, location, description, optional Project Highlight relation fields, Skills, and timestamps. In the form, the primary field order is Company, Role, Slug, dates, location, relation fields, then Description.

## Input contract and validation

The Experience form submits relation slugs rather than database IDs:

- `companySlug`: required single value.
- `projectHighlightSlug`: optional single value.
- `skillSlugs`: optional multiple values; duplicates are removed by validation.

Other fields are `role`, `slug`, `startDate`, optional `endDate`, `location`, and `description`.

The slug is initially generated from the selected Company name and Role, remains editable, and stops being overwritten once manually edited. The server normalizes it and enforces uniqueness. The backend verifies that every submitted relation slug resolves to a record, rejects an end date earlier than the start date, and maps validation failures back to specific form fields.

Creation and update write the Experience and its Skill connections atomically. Updating a slug returns the updated record so the client can navigate to the correct detail URL.

## Rich-text editor

`RichTextEditor` is a reusable controlled client component based on Tiptap. The Next.js integration sets `immediatelyRender: false` to avoid server/client hydration mismatches.

The editor supports only:

- paragraphs;
- H2 and H3 headings;
- bold, italic, and underline;
- bullet and ordered lists;
- blockquotes;
- links;
- undo and redo.

StarterKit is configured to disable capabilities outside this list. Placeholder support is added for the empty editor. Link editing gets a small styled control rather than a native browser prompt. Image, table, horizontal-rule, strike, inline-code, and code-block support are excluded.

The toolbar uses existing Button primitives where suitable. Its typography, borders, background, focus states, and active states follow the landing-page design tokens. The editable area uses the same editorial rhythm as landing content. A separate `RichTextContent` renderer applies matching typography on the detail page.

Tiptap produces HTML. Before persistence, the API sanitizes it with an allowlist matching the editor schema. Links permit only safe `http`, `https`, and `mailto` protocols and receive appropriate safe attributes. The detail page only renders sanitized stored HTML.

Relevant Tiptap guidance:

- Next.js integration and delayed client rendering: <https://tiptap.dev/docs/editor/getting-started/install/nextjs>
- StarterKit configuration: <https://tiptap.dev/docs/editor/extensions/functionality/starterkit>
- Placeholder styling: <https://tiptap.dev/docs/editor/extensions/functionality/placeholder>

## Infinite relation select

`InfiniteSelect` is a reusable presentation component and does not know about API endpoints. It accepts flattened options and query state from its consumer. A discriminated prop contract provides two modes:

- single selection for Company and Project Highlight;
- multiple selection for Skills.

The component provides:

- a searchable combobox-style trigger and dropdown;
- debounced search input;
- keyboard navigation and accessible labels/states;
- an `IntersectionObserver` sentinel to request the next page;
- initial, next-page, empty, and error states;
- retry and clear actions;
- removable chips for multiple selections;
- preservation of selected option labels while the active search result changes.

The dropdown uses the existing theme variables, crisp borders, mono labels, restrained motion, and high-contrast hover/selected states. It avoids a heavy shadow so it remains visually aligned with the landing page.

Data concerns remain in entity-specific hooks:

- `useGetInfiniteCompanies`;
- `useGetInfiniteProjectHighlights`;
- `useGetInfiniteSkills`.

Each hook uses TanStack Query's infinite-query flow, passes page/limit/search to its existing API, and derives the next page from response metadata. Search changes create a distinct query and restart pagination from page one. This boundary keeps the select reusable and preserves entity-specific response types.

## Page and component structure

An `ExperienceForm` component is shared by the create and edit pages. It owns React Hook Form integration, automatic slug behavior, relation-query coordination, Tiptap value synchronization, server field-error mapping, and submission state. Page components remain responsible for loading the initial record, choosing create or update mutation behavior, and navigation.

The index uses a one-column grid. Each full-width card shows:

- Role and Company as the primary identity.
- Start/end period, using `Present` when `endDate` is empty.
- Location.
- Optional Project Highlight.
- Skill badges.
- A plain-text excerpt derived from the HTML description.
- View, Edit, and Delete actions.

Using plain text in the card prevents arbitrary rich markup from disrupting the compact summary. The detail page renders the complete sanitized HTML and all relation information in an editorial layout. Create redirects to the new detail page; edit redirects to the detail page for the returned slug.

## Loading, empty, and error behavior

- Index and detail routes display layout-matched loading states.
- Missing Experience slugs produce a not-found result rather than an empty form.
- The index provides an empty state with a Create Experience action.
- Relation selects distinguish no results from request failure and allow retry.
- Server validation errors appear next to the relevant form controls.
- Unexpected mutation errors appear in the shared Alert component without discarding form input.
- Delete uses the existing confirmation-dialog pattern, with a success or failure alert afterward.
- Submit buttons prevent duplicate submissions and show loading text.

## Cleanup

The old Experience mock records and fields are removed from `complex-entities.ts`. If that leaves the complex-entity configuration unused or changes its union, cleanup is limited to the Experience-related surface; Projects and Posts remain untouched.

## Verification

No automated tests are added in this phase, following the current decision to rebuild tests after the larger refactor. Implementation verification consists of:

- Prisma format, validation, and client generation;
- applying the required development migration;
- ESLint;
- Next.js production build, including TypeScript checks;
- manual CRUD checks for create, detail, edit (including slug change), and delete;
- manual relation-select checks for search, pagination, single/multiple selection, clear, empty, retry, and keyboard interaction;
- manual editor checks for all allowed formatting and sanitized link/HTML behavior;
- responsive and light/dark visual checks for index, form, detail, editor, and dropdown.

## Accepted decisions

- Company is required and single-select.
- Project Highlight is optional and single-select.
- Skills are optional and use multiple selection.
- Relation options use one reusable UI component plus entity-specific infinite-query services.
- Experience forms use dedicated routes, not modals.
- The index is a full-width, one-column card grid.
- The editor deliberately has a small extension set and stores sanitized HTML.
