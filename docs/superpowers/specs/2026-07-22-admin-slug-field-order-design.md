# Admin Slug Field Order Design

## Goal

Make the field order consistent and easier to understand across every admin form that manages an editable slug.

## Scope

Update these admin forms:

- Company
- Skill
- Tag
- Project Highlight

Each form will display its fields in this order:

1. Name
2. Slug
3. The remaining entity-specific fields

## Behavior

This is a presentation-only change. Existing behavior remains unchanged:

- The slug is automatically generated from the name until manually edited.
- A manually edited slug remains editable and is not overwritten by later name changes.
- Existing client and backend validation remains in place.
- Create, update, and delete requests continue to use the existing slug locator behavior.

## Verification

- Inspect all four forms to confirm `Name` is immediately followed by `Slug`.
- Run ESLint and TypeScript checks.
- Do not create or run tests, following the current refactor policy.
