# Production User Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `auth:bootstrap` so an empty production database can create its first User interactively while existing Users retain the secure password-reset flow.

**Architecture:** The existing CLI remains the only provisioning entry point. Shared User validation and a shared PostgreSQL advisory-lock key keep the CLI consistent with Manage User and serialize first-User creation against the final-User deletion guard.

**Tech Stack:** TypeScript, Node.js TTY/readline APIs, Zod, Prisma 7, PostgreSQL advisory locks, Argon2id.

## Global Constraints

- Keep the command `npm run auth:bootstrap -- <username>`.
- Normalize Username to lowercase.
- Never accept Password through arguments or environment variables.
- Only create a User when the database is empty.
- Print usernames only when an unknown User is requested in a non-empty database.
- Keep all successful database writes transactional.
- Do not add or run automated tests during the current large refactor.

---

### Task 1: Share User validation and the management lock

**Files:**

- Modify: `lib/form/user-schema.ts`
- Create: `lib/auth/user-management.ts`
- Modify: `app/api/users/[username]/route.ts`

**Interfaces:**

- Produces `userFieldsSchema` for validating `{ name, username, email }`.
- Produces `USER_MANAGEMENT_LOCK_KEY` for database operations that must serialize User provisioning/deletion.

- [ ] **Step 1: Export the existing User fields schema**

Change the private declaration in `lib/form/user-schema.ts` to:

```ts
export const userFieldsSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  username: z
    .string()
    .trim()
    .min(3, "Username can't be less than 3 characters")
    .transform((username) => username.toLowerCase()),
  email: z.email().min(1, "Email is required"),
});
```

Keep `createUserSchema`, `updateUserSchema`, and their inferred types unchanged.

- [ ] **Step 2: Centralize the advisory-lock key**

Create `lib/auth/user-management.ts`:

```ts
export const USER_MANAGEMENT_LOCK_KEY = "user-management-guard";
```

- [ ] **Step 3: Use the shared lock in User deletion**

Import `USER_MANAGEMENT_LOCK_KEY` into
`app/api/users/[username]/route.ts` and replace the literal lock:

```ts
await transaction.$queryRaw`
  SELECT pg_advisory_xact_lock(
    hashtext(${USER_MANAGEMENT_LOCK_KEY})
  )
`;
```

This preserves the current count-and-delete transaction while allowing
the bootstrap CLI to coordinate with it.

- [ ] **Step 4: Verify the shared contracts**

Run:

```bash
npx tsc --noEmit --incremental false
npx eslint lib/form/user-schema.ts lib/auth/user-management.ts app/api/users/'[username]'/route.ts
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 5: Commit**

```bash
git add lib/form/user-schema.ts lib/auth/user-management.ts app/api/users/'[username]'/route.ts
git commit -m "refactor: share user management guards"
```

---

### Task 2: Add first-User provisioning to the bootstrap CLI

**Files:**

- Modify: `scripts/bootstrap-user-password.ts`

**Interfaces:**

- Consumes `userFieldsSchema`, `passwordSchema`, `hashPassword`, and
  `USER_MANAGEMENT_LOCK_KEY`.
- Preserves `npm run auth:bootstrap -- <username>`.
- Produces either `User @username created.` or
  `Password updated for @username.`.

- [ ] **Step 1: Add visible terminal input**

Import `createInterface`:

```ts
import { createInterface } from "node:readline/promises";
```

Add a helper that shares the existing TTY requirement:

```ts
async function readVisible(prompt: string) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "Password bootstrap requires an interactive terminal.",
    );
  }

  const terminal = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    return (await terminal.question(prompt)).trim();
  } finally {
    terminal.close();
  }
}
```

- [ ] **Step 2: Extract the existing Password collection**

Add:

```ts
async function collectPassword() {
  const password = await readHidden("New password: ");
  const confirmation = await readHidden("Confirm password: ");
  const parsed = passwordSchema.safeParse(password);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid password.",
    );
  }

  if (password !== confirmation) {
    throw new Error("Password confirmation does not match.");
  }

  return hashPassword(password);
}
```

Use this helper in both creation and reset flows so Password input,
validation, and hashing remain identical.

- [ ] **Step 3: Preserve the existing password-reset flow**

Add:

```ts
async function resetPassword(user: {
  id: number;
  username: string;
}) {
  const password = await collectPassword();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password },
    }),
    prisma.session.deleteMany({
      where: { userId: user.id },
    }),
  ]);

  process.stdout.write(
    `Password updated for @${user.username}.\n`,
  );
}
```

When the requested User exists, call `resetPassword(user)` and return
from `main`.

- [ ] **Step 4: Refuse unknown usernames in a non-empty database**

When the requested User does not exist, query:

```ts
const availableUsers = await prisma.user.findMany({
  select: { username: true },
  orderBy: { username: "asc" },
});
```

If `availableUsers.length > 0`, throw:

```ts
const usernames = availableUsers
  .map(({ username }) => `@${username}`)
  .join(", ");

throw new Error(
  `User not found. Available usernames: ${usernames}`,
);
```

Do not query or print Name, Email, Password, Session, or other fields.

- [ ] **Step 5: Collect and validate first-User fields**

For an empty database, prompt and parse:

```ts
const name = await readVisible("Name: ");
const email = await readVisible("Email: ");
const fields = userFieldsSchema.safeParse({
  name,
  username,
  email,
});

if (!fields.success) {
  throw new Error(
    fields.error.issues[0]?.message ?? "Invalid User details.",
  );
}

const password = await collectPassword();
```

- [ ] **Step 6: Create the first User transactionally**

Use the shared advisory lock and recheck the database inside the
transaction:

```ts
const createdUser = await prisma.$transaction(
  async (transaction) => {
    await transaction.$queryRaw`
      SELECT pg_advisory_xact_lock(
        hashtext(${USER_MANAGEMENT_LOCK_KEY})
      )
    `;

    if ((await transaction.user.count()) > 0) {
      throw new Error(
        "User provisioning was completed by another process.",
      );
    }

    return transaction.user.create({
      data: {
        name: fields.data.name,
        username: fields.data.username,
        email: fields.data.email,
        password,
      },
      select: { username: true },
    });
  },
);

process.stdout.write(
  `User @${createdUser.username} created.\n`,
);
```

- [ ] **Step 7: Verify safe CLI behavior**

Run the non-TTY command:

```bash
npm run auth:bootstrap -- auth-non-tty-check
```

Expected: exit `1` with
`Password bootstrap requires an interactive terminal.` and no database
write.

Run the command from an interactive terminal against the current
non-empty database:

```bash
npm run auth:bootstrap -- user-that-does-not-exist
```

Expected: exit `1` and print only:

```text
User not found. Available usernames: @pykule
```

If the current database username has changed, the expected username is
the current lowercase username instead of `@pykule`.

- [ ] **Step 8: Run full static verification**

Run:

```bash
npx prisma validate
npx tsc --noEmit --incremental false
npm run lint
npm run build
git diff --check
```

Expected: all commands exit `0`. Existing `metadataBase` warnings may
remain; no new errors are accepted.

- [ ] **Step 9: Commit**

```bash
git add scripts/bootstrap-user-password.ts
git commit -m "feat: provision first production user"
```

---

### Task 3: Final security review

**Files:**

- Review: `scripts/bootstrap-user-password.ts`
- Review: `lib/form/user-schema.ts`
- Review: `lib/auth/user-management.ts`
- Review: `app/api/users/[username]/route.ts`

**Interfaces:**

- Confirms the approved spec is fully implemented without expanding
  into registration, invitations, roles, or HTTP provisioning.

- [ ] **Step 1: Audit secret handling**

Run:

```bash
rg -n "password|AUTH_SECRET|DATABASE_URL" scripts/bootstrap-user-password.ts
```

Confirm:

- Password is read only by `readHidden`;
- Password values and hashes are never printed;
- no Password argument or Password environment variable exists;
- `.env` is loaded only for runtime configuration.

- [ ] **Step 2: Audit database guards**

Confirm both provisioning and deletion import
`USER_MANAGEMENT_LOCK_KEY`, acquire the advisory lock inside their
transactions, and recheck their User-count invariant after acquiring
the lock.

- [ ] **Step 3: Inspect repository state**

Run:

```bash
git status --short
git log -3 --oneline
```

Expected: no uncommitted files from this implementation and both feature
commits are visible.
