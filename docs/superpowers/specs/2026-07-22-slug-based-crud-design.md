# Slug-Based CRUD Design

## Goal

Use stable, human-readable identifiers in every existing admin CRUD API while retaining integer primary keys for internal database relations.

## Entity Identity

The five active CRUD entities use these public identifiers:

| Entity | Public identifier | Prisma constraint |
| --- | --- | --- |
| User | `username` | Existing `@unique` |
| Company | `slug` | New `String @unique` |
| Skill | `slug` | New `String @unique` |
| Tag | `slug` | New `String @unique` |
| ProjectHighlight | `slug` | New `String @unique` |

Integer `id` fields remain the Prisma primary keys. Existing foreign keys and many-to-many relations continue to reference integer IDs. IDs may remain present in API records and may be used as React keys, but PATCH and DELETE operations must not use them as public identifiers.

## API Routes

Rename dynamic API route segments as follows:

- `app/api/users/[id]/route.ts` to `app/api/users/[username]/route.ts`
- `app/api/companies/[id]/route.ts` to `app/api/companies/[slug]/route.ts`
- `app/api/skills/[id]/route.ts` to `app/api/skills/[slug]/route.ts`
- `app/api/tags/[id]/route.ts` to `app/api/tags/[slug]/route.ts`
- `app/api/project-highlights/[id]/route.ts` to `app/api/project-highlights/[slug]/route.ts`

PATCH and DELETE resolve records through the identifier in the URL. A PATCH may change that identifier by sending a new `username` or `slug` in its payload. The route locates the record using the old URL identifier, validates the new value, performs the update, and returns the updated record.

Missing records return `404`. Duplicate public identifiers return `422` with a field-level error on `username` or `slug`. Foreign-key delete conflicts retain their existing `409` behavior.

## Slug Input and Normalization

Company, Skill, Tag, and ProjectHighlight forms expose a `slug` text field.

On create, the client derives the slug from `name` while the slug field has not been manually edited. Once the user edits the slug field, subsequent name changes do not overwrite it. On edit, the saved slug is loaded and remains independently editable.

The backend is authoritative. For create requests:

1. Trim the submitted slug.
2. If it is empty or absent, derive it from `name`.
3. Normalize it to lowercase kebab-case.
4. Reject an empty normalized result.
5. Reject a duplicate normalized slug with status `422`.

For update requests, a supplied slug follows the same normalization and uniqueness rules. An omitted slug preserves the current slug. The API never silently adds numeric suffixes during normal create or update operations; users resolve collisions by editing the slug.

Accepted slugs contain lowercase ASCII letters, digits, and single hyphens between segments. Leading, trailing, and repeated separators are normalized before validation.

## User Username Behavior

User routes use `username` directly. The create and update schemas retain username validation and uniqueness checks. Updating a username uses the old username from the URL to locate the user, then stores the new username from the payload. The client must keep the original username separately from editable form values so the request targets the correct record.

## Prisma Migration

Add required unique slug columns to `companies`, `skills`, `tags`, and `project_highlights` through a data-preserving migration:

1. Add each slug column as nullable.
2. Backfill existing rows from normalized `name` values.
3. Use a deterministic fallback such as `<entity>-<id>` when normalization is empty.
4. When normalized values collide, preserve one base slug and append `-<id>` to the remaining collisions.
5. Make each slug column non-null.
6. Create a unique index for each slug column.

The Prisma schema then declares each field as `slug String @unique`. No primary key or relationship column changes are included.

## Client and Service Changes

React Query mutation services accept string locators:

- User update/delete accepts `username`.
- The other four entity update/delete services accept `slug`.

Admin client pages keep the original identifier when opening an edit modal. Mutation URLs use the original identifier even when the form submits a replacement identifier. Delete state stores a username or slug string instead of a numeric ID. Successful mutations continue invalidating each entity's list query; detail-query invalidation uses the old and new identifier when relevant.

## Error Handling

Backend uniqueness checks provide predictable field errors before mutation. Prisma `P2002` handling remains as a race-condition fallback. Prisma `P2025` maps to `404`, and existing `P2003` relation protection remains unchanged.

Malformed or empty URL identifiers return `400`. Error messages use the public term `slug` or `username`, never `id`.

## Verification

The repository currently has no automated test suite by explicit project decision during the broader refactor. This change does not recreate tests.

Verification requires:

1. Prisma schema formatting and validation.
2. Prisma client generation.
3. Migration status and SQL inspection.
4. Repository-wide confirmation that active PATCH/DELETE routes and services no longer use `[id]` or numeric ID locators for these five CRUD entities.
5. ESLint with zero errors.
6. A successful Next.js production build.

The migration is created in the repository but is not applied to a database unless explicitly authorized separately.
