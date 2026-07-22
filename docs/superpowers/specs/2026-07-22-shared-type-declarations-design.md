# Shared Type Declarations Design

## Goal

Consolidate repeated cross-module type declarations into explicit `.d.ts` modules under `types/`, while keeping genuinely local contracts beside their implementation.

## Conventions

- Shared type files use the `.d.ts` extension.
- Every shared declaration is exported from a module and imported explicitly by consumers.
- Do not introduce ambient global declarations.
- Prefer generic contracts over entity-specific aliases when their structures are identical.
- Preserve runtime behavior; this refactor changes TypeScript contracts and imports only.

## API Types

Extend `types/api.d.ts` as the single source for API transport contracts:

- `ApiResponse<T>` for `{ message: string; data: T }`.
- `PaginatedResponse<T, TMeta>` for collection responses.
- `QueryParams` for optional `page`, `limit`, and `search` values.
- `ValidationErrorResponse<TField>` for field-keyed validation errors.
- `DeleteResponse` for successful delete messages.
- `DeleteErrorResponse` for delete failures with an optional technical error.
- `MutationVariables<TPayload, TLocator>` for update payloads addressed by a named string locator.
- `RouteContext<TParams>` for Next.js route params wrapped in a promise.
- Existing `MetaPagination` for `{ page, limit, total, totalPages, hasNextPage, hasPrevPage }`.
- `LegacyMetaPagination` for `{ currentPage, perPage, total, totalPages, hasNextPage, hasPreviousPage }`.

The generic types replace repeated declarations across user, company, skill, tag, and project-highlight services and dynamic API routes.

Tag collection types will use `LegacyMetaPagination`, matching the current API response. This corrects an existing type-only mismatch without changing the response format.

## Admin Types

Create `types/admin.d.ts` for shared admin presentation contracts:

- `FormMode` for `"create" | "edit"`.
- `FormModalState` for modal state with a required mode.
- `OptionalModeFormModalState` for the two existing nullable flows whose mode can be absent.
- `EventMessage` for success and failure notifications.
- `ComplexEntityKind`, `ComplexFieldType`, `ComplexField`, `ComplexRecord`, and `ComplexEntityConfig` for complex-entity configuration.

Company, Skill, and Tag pages use `FormModalState`. User and Project Highlight pages use `OptionalModeFormModalState`, preserving their existing state shape rather than weakening every consumer.

## Complex Entity Duplication

`lib/admin/complex-entities.ts` and `lib/constants/complex-entities.ts` are currently identical in full and unused by application imports.

- Keep `lib/constants/complex-entities.ts` as the single configuration source.
- Move its exported type declarations to `types/admin.d.ts` and import them with `import type`.
- Delete `lib/admin/complex-entities.ts`.

## Local Types That Remain Local

Do not move these declarations merely because they use common names:

- Component `Props` types with component-specific contracts.
- Zod-inferred form schema types.
- Login form values.
- Portfolio content models.
- Entity-specific response aliases whose structures are not identical.
- Prisma-generated model types.

## Scope and Safety

- Do not change API JSON shapes or route behavior.
- Do not change React Query keys or invalidation behavior.
- Do not change admin UI state behavior.
- Preserve the user's uncommitted changes in `components/login/login-form.tsx`.
- Do not create or run tests during the current refactor.

## Verification

- Audit repeated declarations after migration.
- Confirm no imports reference `lib/admin/complex-entities.ts`.
- Run ESLint and TypeScript checking.
- Run a production build.
- Confirm only intentionally local type declarations remain outside `types/`.
