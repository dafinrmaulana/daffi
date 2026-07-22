# Admin Slug Field Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display `Name` immediately before `Slug` in every admin form with an editable slug.

**Architecture:** Reorder the existing JSX input blocks without changing registration, autofill state, validation, API payloads, or mutation locators. The change is limited to presentation order in four existing client components.

**Tech Stack:** Next.js 16, React 19, TypeScript, React Hook Form, ESLint

## Global Constraints

- Apply the order `Name` → `Slug` → remaining entity-specific fields.
- Preserve automatic slug generation until the slug is manually edited.
- Preserve all existing validation and CRUD behavior.
- Do not create or run tests during the current refactor.
- Preserve unrelated user changes in `app/api/project-highlights/route.ts`.

---

### Task 1: Reorder Admin Form Fields

**Files:**
- Modify: `app/admin/companies/company-client-page.tsx`
- Modify: `app/admin/skills/skill-client-page.tsx`
- Modify: `app/admin/tags/tags-client-page.tsx`
- Modify: `app/admin/project-highlights/project-highlights-client-page.tsx`

**Interfaces:**
- Consumes: Existing `register("name")`, `slugRegistration`, `slugManuallyEdited`, and input validation messages.
- Produces: The same form values and behavior with `Name` rendered immediately before `Slug`.

- [ ] **Step 1: Move the existing Name input above Slug**

In each listed component, retain the existing input properties and handlers, but order the JSX blocks as follows:

```tsx
<Input
  required
  id="name"
  type="text"
  label="Name"
  {...register("name")}
/>

<Input
  id="slug"
  type="text"
  label="Slug"
  {...slugRegistration}
  onChange={(event) => {
    slugManuallyEdited.current = true;
    slugRegistration.onChange(event);
  }}
/>
```

Keep each component's current placeholder, error message, and prefix icon. Place description, logo, and other entity-specific fields after the slug input.

- [ ] **Step 2: Audit the rendered field order**

Run:

```bash
rg -n 'label="(Name|Slug)"' \
  app/admin/companies/company-client-page.tsx \
  app/admin/skills/skill-client-page.tsx \
  app/admin/tags/tags-client-page.tsx \
  app/admin/project-highlights/project-highlights-client-page.tsx
```

Expected: Within every file, `Name` appears before `Slug` and therefore has the smaller line number.

- [ ] **Step 3: Run static verification**

Run:

```bash
npm run lint
npx tsc --noEmit --incremental false
git diff --check
```

Expected: All commands exit with code 0. No test command is run.

- [ ] **Step 4: Commit the presentation change**

```bash
git add \
  app/admin/companies/company-client-page.tsx \
  app/admin/skills/skill-client-page.tsx \
  app/admin/tags/tags-client-page.tsx \
  app/admin/project-highlights/project-highlights-client-page.tsx
git diff --cached --check
git commit -m "fix: place slug fields after names"
```
