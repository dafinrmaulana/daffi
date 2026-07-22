# Kebab-Case File Names Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename all project-owned source and test files to kebab-case and update every active or documented reference without changing runtime behavior.

**Architecture:** Apply an explicit rename map in three bounded groups: form schemas, components, and tests. Update imports and literal documentation paths after each group, then prove reference integrity with repository-wide searches before running the existing verification suite.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, ESLint, Git

## Global Constraints

- Preserve Next.js entry points: `page.tsx`, `route.ts`, and `layout.tsx`.
- Preserve tooling, framework, Prisma schema, generated, migration, environment, repository metadata, and public asset filenames.
- Preserve `.test.ts`, `.test.tsx`, and `.d.ts` role suffixes.
- Keep exported component and type symbols unchanged; only file paths and references may change.
- Preserve all pre-existing user work, including untracked Experience files, except for the requested filename and import-path changes.
- Do not stage or commit implementation changes because the working tree contains pre-existing untracked user work.

---

### Task 1: Rename Form Schema Files

**Files:**
- Move: `lib/form/company.schema.ts` → `lib/form/company-schema.ts`
- Move: `lib/form/experience.schema.ts` → `lib/form/experience-schema.ts`
- Move: `lib/form/project-highlight.schema.ts` → `lib/form/project-highlight-schema.ts`
- Move: `lib/form/skill.schema.ts` → `lib/form/skill-schema.ts`
- Move: `lib/form/tag.schema.ts` → `lib/form/tag-schema.ts`
- Move: `lib/form/user.schema.ts` → `lib/form/user-schema.ts`
- Modify: every `app/**/*.ts`, `app/**/*.tsx`, and `lib/services/**/*.ts` importer of these schemas

**Interfaces:**
- Consumes: Existing Zod schema exports and TypeScript schema types.
- Produces: The same exports at kebab-case module paths under `@/lib/form/*-schema`.

- [ ] **Step 1: Capture the existing schema references**

Run:

```bash
rg -n '@/lib/form/[^";]+\.schema' app lib tests
```

Expected: references to the six old dotted schema module paths, including the untracked Experience routes.

- [ ] **Step 2: Move the schema files with the explicit mapping**

Use Git-aware moves for the five tracked schemas and a normal move for the untracked Experience schema:

```bash
git mv lib/form/company.schema.ts lib/form/company-schema.ts
git mv lib/form/project-highlight.schema.ts lib/form/project-highlight-schema.ts
git mv lib/form/skill.schema.ts lib/form/skill-schema.ts
git mv lib/form/tag.schema.ts lib/form/tag-schema.ts
git mv lib/form/user.schema.ts lib/form/user-schema.ts
mv lib/form/experience.schema.ts lib/form/experience-schema.ts
```

Expected: all six destination files exist, and `git status --short` still shows Experience as untracked.

- [ ] **Step 3: Update schema import paths without changing imported symbols**

Replace only these module path fragments throughout `app` and `lib`:

```text
@/lib/form/company.schema            → @/lib/form/company-schema
@/lib/form/experience.schema         → @/lib/form/experience-schema
@/lib/form/project-highlight.schema  → @/lib/form/project-highlight-schema
@/lib/form/skill.schema              → @/lib/form/skill-schema
@/lib/form/tag.schema                → @/lib/form/tag-schema
@/lib/form/user.schema               → @/lib/form/user-schema
```

Do not change names such as `companySchema`, `ExperienceSchema`, or `updateUserSchema`.

- [ ] **Step 4: Verify the schema rename group**

Run:

```bash
rg -n '@/lib/form/[^";]+\.schema' app lib tests
rg --files lib/form | sort
```

Expected: the first command returns no matches; the second lists only kebab-case schema filenames.

---

### Task 2: Rename Component Source Files

**Files:**
- Move the following component files and update all importers in `app`, `components`, and `tests`:

```text
components/admin/AdminPageHeader.tsx → components/admin/admin-page-header.tsx
components/admin/AdminShell.tsx → components/admin/admin-shell.tsx
components/admin/AdminSidebar.tsx → components/admin/admin-sidebar.tsx
components/admin/ConfirmDialog.tsx → components/admin/confirm-dialog.tsx
components/admin/EmptyContent.tsx → components/admin/empty-content.tsx
components/admin/EntityCard.tsx → components/admin/entity-card.tsx
components/admin/Modal.tsx → components/admin/modal.tsx
components/blog/PostCard.tsx → components/blog/post-card.tsx
components/form/Input.tsx → components/form/input.tsx
components/home/ContactCTA.tsx → components/home/contact-cta.tsx
components/home/Hero.tsx → components/home/hero.tsx
components/home/SkillsTicker.tsx → components/home/skills-ticker.tsx
components/home/WorkPreview.tsx → components/home/work-preview.tsx
components/layout/CrudLayout.tsx → components/layout/crud-layout.tsx
components/layout/Footer.tsx → components/layout/footer.tsx
components/layout/Header.tsx → components/layout/header.tsx
components/layout/Section.tsx → components/layout/section.tsx
components/layout/SiteChrome.tsx → components/layout/site-chrome.tsx
components/layout/SocialRail.tsx → components/layout/social-rail.tsx
components/login/LoginForm.tsx → components/login/login-form.tsx
components/shared/ExperienceSection.tsx → components/shared/experience-section.tsx
components/shared/SectionTitle.tsx → components/shared/section-title.tsx
components/ui/Badge.tsx → components/ui/badge.tsx
components/ui/Button.tsx → components/ui/button.tsx
components/ui/CreateButton.tsx → components/ui/create-button.tsx
components/ui/ThemeToggle.tsx → components/ui/theme-toggle.tsx
components/work/ProjectCard.tsx → components/work/project-card.tsx
```

**Interfaces:**
- Consumes: Existing default and named component exports.
- Produces: Identical exports reachable through kebab-case module paths.

- [ ] **Step 1: Capture component imports and mocks before moving files**

Run:

```bash
rg -n '@/components/.*/[A-Z][A-Za-z]*' app components tests
```

Expected: imports and Vitest mocks that still use PascalCase file paths.

- [ ] **Step 2: Move each component through a temporary filename**

For each mapping above, perform `git mv <old> <temporary>` followed by `git mv <temporary> <new>`. The intermediate filename must differ by more than case, for example:

```bash
git mv components/admin/AdminShell.tsx components/admin/admin-shell.rename-tmp.tsx
git mv components/admin/admin-shell.rename-tmp.tsx components/admin/admin-shell.tsx
```

Expected: Git records renames correctly on both case-sensitive and case-insensitive filesystems.

- [ ] **Step 3: Update all component import and mock paths**

Update `@/components/...` and relative component paths to the mapped kebab-case filenames. Preserve imported/exported identifiers, including `AdminShell`, `EmptyContent`, `Input`, `Button`, and `CreateButton`.

Representative changes:

```ts
import { AdminShell } from "@/components/admin/admin-shell";
import Input from "@/components/form/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
```

Vitest mocks must use the same new module strings:

```ts
vi.mock("@/components/login/login-form", () => ({
  LoginForm: () => <div>Login form</div>,
}));
```

- [ ] **Step 4: Verify the component rename group**

Run:

```bash
rg -n '@/components/.*/[A-Z][A-Za-z]*' app components tests
find components -type f | sort
```

Expected: the first command returns no matches; component source filenames in the second output are lowercase kebab-case.

---

### Task 3: Rename Test Files and Documentation Paths

**Files:**
- Move:

```text
tests/app/admin/AdminDashboard.test.tsx → tests/app/admin/admin-dashboard.test.tsx
tests/app/admin/SimpleCrudRoutes.test.tsx → tests/app/admin/simple-crud-routes.test.tsx
tests/components/admin/AdminPrimitives.test.tsx → tests/components/admin/admin-primitives.test.tsx
tests/components/admin/AdminShell.test.tsx → tests/components/admin/admin-shell.test.tsx
tests/components/admin/ComplexCrud.test.tsx → tests/components/admin/complex-crud.test.tsx
tests/components/admin/SimpleCrudPage.test.tsx → tests/components/admin/simple-crud-page.test.tsx
tests/components/layout/SiteChrome.test.tsx → tests/components/layout/site-chrome.test.tsx
tests/components/login/LoginForm.test.tsx → tests/components/login/login-form.test.tsx
tests/components/login/LoginPage.test.tsx → tests/components/login/login-page.test.tsx
tests/lib/admin/ComplexEntities.test.ts → tests/lib/admin/complex-entities.test.ts
tests/lib/admin/SimpleEntities.test.ts → tests/lib/admin/simple-entities.test.ts
```

- Modify: Markdown files under `docs` that contain literal old source or test paths

**Interfaces:**
- Consumes: Existing Vitest suites and historical design/implementation documentation.
- Produces: The same test suites under kebab-case filenames and accurate documentation path references.

- [ ] **Step 1: Move test files through temporary filenames**

For each mapping above, use the same two-step Git move strategy as Task 2. Example:

```bash
git mv tests/components/admin/AdminShell.test.tsx tests/components/admin/admin-shell.rename-tmp.test.tsx
git mv tests/components/admin/admin-shell.rename-tmp.test.tsx tests/components/admin/admin-shell.test.tsx
```

Expected: no PascalCase test filenames remain.

- [ ] **Step 2: Update literal paths in documentation**

Apply the Task 1, Task 2, and Task 3 mappings to path references inside `docs/**/*.md`. Do not lowercase exported symbol names, headings about components, or prose identifiers; update only filename/path tokens and commands that refer to renamed files.

Example:

```text
components/admin/AdminShell.tsx         → components/admin/admin-shell.tsx
tests/components/admin/AdminShell.test.tsx → tests/components/admin/admin-shell.test.tsx
@/components/ui/ThemeToggle             → @/components/ui/theme-toggle
```

- [ ] **Step 3: Verify all eligible filenames are kebab-case**

Run:

```bash
find components tests lib/form -type f | sort
find components tests lib/form -type f | awk -F/ '{ name=$NF; if (name ~ /[A-Z_ ]/) print }'
```

Expected: the second command returns no output.

- [ ] **Step 4: Search for every old naming pattern**

Run:

```bash
rg -n 'components/[^`" ]*/[A-Z][A-Za-z]*|tests/[^`" ]*/[A-Z][A-Za-z]*|lib/form/[a-z-]+\.schema' app components lib tests docs
```

Expected: no path or module reference matches. PascalCase exported identifiers without a path are allowed.

---

### Task 4: Full Regression Verification

**Files:**
- Verify: all renamed source and test files
- Verify: all importers and documentation references

**Interfaces:**
- Consumes: Completed rename map from Tasks 1–3.
- Produces: A behavior-preserving kebab-case refactor ready for user review.

- [ ] **Step 1: Inspect Git state and rename detection**

Run:

```bash
git status --short
git diff --summary
git diff --name-status
```

Expected: tracked component/schema/test changes appear as renames plus import/documentation edits; Experience files remain untracked under their new kebab-case names.

- [ ] **Step 2: Check whitespace and patch integrity**

Run:

```bash
git diff --check
```

Expected: exit code 0 with no output.

- [ ] **Step 3: Run the complete test suite**

Run:

```bash
npm test
```

Expected: all Vitest suites pass under their new kebab-case filenames.

- [ ] **Step 4: Run lint**

Run:

```bash
npm run lint
```

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 5: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js production build completes and resolves every renamed module.

- [ ] **Step 6: Perform the final filename audit**

Run:

```bash
find components tests lib/form -type f | awk -F/ '{ name=$NF; if (name ~ /[A-Z_ ]/) print }'
rg -n 'components/[^`" ]*/[A-Z][A-Za-z]*|tests/[^`" ]*/[A-Z][A-Za-z]*|lib/form/[a-z-]+\.schema' app components lib tests docs
```

Expected: both commands return no output. Do not stage or commit the implementation; return the verified working tree to the user for review.
