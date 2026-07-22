# Kebab-Case File Names Design

## Goal

Normalize project-owned source and test file names to kebab-case while preserving framework, tooling, generated, migration, and asset naming conventions.

## Scope

Rename project-owned source and test files whose descriptive base name is not kebab-case. Examples include:

- `components/admin/AdminShell.tsx` to `components/admin/admin-shell.tsx`
- `components/home/ContactCTA.tsx` to `components/home/contact-cta.tsx`
- `tests/app/admin/AdminDashboard.test.tsx` to `tests/app/admin/admin-dashboard.test.tsx`
- `lib/form/experience.schema.ts` to `lib/form/experience-schema.ts`

Compound semantic suffixes remain intact. Test files retain `.test.ts` or `.test.tsx`, and TypeScript declaration files retain `.d.ts`.

## Exclusions

The refactor must not rename:

- Next.js entry points such as `page.tsx`, `route.ts`, and `layout.tsx`.
- Tooling and framework files such as `package.json`, `package-lock.json`, `tsconfig.json`, `next-env.d.ts`, `next.config.mjs`, `eslint.config.mjs`, `postcss.config.js`, `tailwind.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, and `prisma.config.ts`.
- Prisma schema, generated client files, migrations, and migration metadata.
- Environment and repository metadata files.
- Files under `public`, including the existing PDF and image assets.
- Existing files whose descriptive names already use kebab-case.

## Rename Strategy

Use an explicit old-to-new mapping rather than a broad automatic converter. Tracked files are moved with Git-aware renames; untracked files are moved normally. If only letter casing changes, use an intermediate temporary name so the operation works reliably on case-insensitive filesystems.

After each rename group, update static imports, dynamic imports, test imports, mocks, source-reading paths, and documentation references. Component and symbol names remain PascalCase; only file paths change.

Schema files use a hyphenated descriptive name rather than a dotted descriptive segment:

- `company.schema.ts` becomes `company-schema.ts`.
- `project-highlight.schema.ts` becomes `project-highlight-schema.ts`.

Suffixes that identify a file's role remain dotted:

- `AdminShell.test.tsx` becomes `admin-shell.test.tsx`.
- `api.d.ts` remains `api.d.ts` because `api` is already kebab-case and `.d.ts` is a declaration suffix.

## Reference Integrity

Every import that refers to a renamed file must be updated to the new path. Documentation and tests that contain literal source paths must also be updated. The refactor must not alter exported symbol names, runtime behavior, API routes, component behavior, data models, or content.

## Safety and Verification

The existing untracked Experience work is in scope only for its source-file name and imports. Its contents must otherwise remain unchanged.

Verification consists of:

1. Search the project for every old filename and import path; no active reference may remain.
2. Inspect `git status` and the rename diff to confirm only intended file moves and reference edits occurred.
3. Run `git diff --check`.
4. Run the full test suite.
5. Run lint.
6. Run the production build.

Completion requires all verification commands to pass, or any pre-existing failure to be isolated and reported with evidence.
