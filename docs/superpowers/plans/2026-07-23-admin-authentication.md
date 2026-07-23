# Admin Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add secure username/password login, revocable database sessions, layered admin/API protection, and password management for every User administrator.

**Architecture:** Extend Prisma with an Argon2id hash column, Session records, and anonymous login-throttle buckets. Central server-only auth modules own password hashing, opaque session tokens, request/origin checks, DTOs, and authorization; Login, Admin layout, Manage User, and every content API consume those boundaries.

**Tech Stack:** Next.js 16 App Router and Proxy, React 19, TypeScript, Prisma 7/PostgreSQL, Zod 4, React Hook Form, Axios/TanStack Query, Node Crypto, `@node-rs/argon2` 2.0.2.

## Global Constraints

- Every authenticated User is a full administrator; do not add roles.
- Login uses Username and Password.
- Prisma field and database column are both named `password`, but contain only an Argon2id encoded hash.
- Existing passwordless User remains migratable but cannot log in before terminal bootstrap.
- New passwords are 15–128 Unicode characters with no composition rule.
- Default database Session expires after 12 hours; Remember me expires after 30 days.
- Raw session tokens exist only in HTTP-only cookies; PostgreSQL stores SHA-256 token hashes.
- Five failed attempts per normalized username or IP bucket in 15 minutes trigger temporary throttling.
- Never log or serialize plaintext Password, encoded Password, raw session token, or raw throttle identifiers.
- Every `/admin` page and every content-management API requires a live database Session.
- Unsafe same-origin API requests require a matching `Origin`.
- Automated tests are not added or run during this refactor, per the accepted project constraint.
- Use normal Prisma migration workflow; do not use migrate-fresh.

---

## File Map

### Create

- `types/auth.d.ts`: authenticated User DTO and auth payload/result contracts.
- `lib/auth/constants.ts`: cookie names, durations, throttle limits, and protected API prefixes.
- `lib/auth/password.ts`: Password schema, Argon2id hash, verify, and dummy verify.
- `lib/auth/crypto.ts`: random token, SHA-256, and keyed throttle hash.
- `lib/auth/user-dto.ts`: explicit safe User select/serializer.
- `lib/auth/session.ts`: Session creation, verification, revocation, and cookie lifecycle.
- `lib/auth/request.ts`: same-origin check, client-address resolver, and safe redirect validation.
- `lib/auth/throttle.ts`: username/IP throttle evaluation, recording, and clearing.
- `lib/auth/authorize.ts`: page and API authorization boundaries.
- `app/api/auth/login/route.ts`: credential login.
- `app/api/auth/logout/route.ts`: Session revocation.
- `app/api/auth/session/route.ts`: authenticated DTO endpoint.
- `lib/services/auth/login.ts`: login mutation.
- `lib/services/auth/logout.ts`: logout mutation.
- `components/admin/admin-account.tsx`: current User summary and Logout control.
- `proxy.ts`: optimistic Admin cookie check.
- `scripts/bootstrap-user-password.ts`: hidden terminal bootstrap.
- `prisma/migrations/<timestamp>_add_admin_authentication/migration.sql`: generated Prisma migration.

### Modify

- `package.json`, `package-lock.json`: Argon2 dependency and bootstrap script.
- `.env.example`: valid database placeholder and `AUTH_SECRET`.
- `prisma/schema.prisma`: Password, Session, LoginThrottle.
- `components/login/login-form.tsx`: real username/password login.
- `app/login/page.tsx`: database-session redirect and safe `next` handoff.
- `app/admin/layout.tsx`: secure Session verification and no-store boundary.
- `components/admin/admin-shell.tsx`: authenticated User prop.
- `components/admin/admin-sidebar.tsx`: account display and Logout.
- `lib/form/user-schema.ts`: create/update Password contracts.
- `app/admin/users/users-client-page.tsx`: Password/Confirmation fields and safe DTO.
- `lib/services/users/create-user.ts`: create payload/DTO typing.
- `lib/services/users/update-user.ts`: update payload/DTO typing.
- `lib/services/users/get-users.ts`: safe DTO typing.
- `app/api/users/route.ts`: protected DTO list/create and Password hashing.
- `app/api/users/[username]/route.ts`: protected update/delete, revocation, and lockout guards.
- All route files under Companies, Skills, Tags, Project Highlights, Experiences, Projects, and Posts: require authenticated API Session.

---

### Task 1: Dependency, Prisma schema, and migration

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.env.example`
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_admin_authentication/migration.sql`

**Interfaces:**

- Produces Prisma `User.password`, `User.sessions`, `Session`, and `LoginThrottle`.
- Makes `@node-rs/argon2` available to Task 2.

- [ ] **Step 1: Install the pinned Argon2id package**

Run:

```bash
npm install @node-rs/argon2@2.0.2
```

Expected: package and lockfile contain `@node-rs/argon2` 2.0.2 and its platform packages.

- [ ] **Step 2: Add auth environment documentation**

Replace the malformed database example with:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/daffi"
AUTH_SECRET="generate-with-openssl-rand-base64-32"
```

`AUTH_SECRET` must be at least 32 characters in runtime validation. Do not modify `.env` or commit a real secret.

- [ ] **Step 3: Extend Prisma**

Add to `User`:

```prisma
password String?
sessions Session[]
```

Add:

```prisma
model Session {
  id         Int      @id @default(autoincrement())
  tokenHash  String   @unique @map("token_hash")
  userId     Int      @map("user_id")
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt  DateTime @map("expires_at")
  lastSeenAt DateTime @default(now()) @map("last_seen_at")
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([expiresAt])
  @@map("sessions")
}

model LoginThrottle {
  id              Int       @id @default(autoincrement())
  keyHash         String    @unique @map("key_hash")
  failureCount    Int       @default(0) @map("failure_count")
  windowStartedAt DateTime  @map("window_started_at")
  blockedUntil    DateTime? @map("blocked_until")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  @@index([updatedAt])
  @@map("login_throttles")
}
```

- [ ] **Step 4: Generate and apply a normal migration**

Run:

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev --name add_admin_authentication
npx prisma generate
```

Expected: migration adds nullable `users.password`, both new tables, indexes, and cascade relation without deleting existing User data.

- [ ] **Step 5: Verify and commit**

Run:

```bash
npx tsc --noEmit --incremental false
npm run lint
git diff --check
```

Commit:

```bash
git add package.json package-lock.json .env.example prisma
git commit -m "feat: add authentication persistence"
```

---

### Task 2: Auth contracts, Password hashing, crypto, and safe User DTO

**Files:**

- Create: `types/auth.d.ts`
- Create: `lib/auth/constants.ts`
- Create: `lib/auth/password.ts`
- Create: `lib/auth/crypto.ts`
- Create: `lib/auth/user-dto.ts`

**Interfaces:**

- Produces:
  - `AuthUser`
  - `LoginInput`
  - `LoginResponse`
  - `passwordSchema`
  - `hashPassword(password): Promise<string>`
  - `verifyPassword(hash, password): Promise<boolean>`
  - `verifyPasswordOrDummy(hash, password): Promise<boolean>`
  - `createSessionToken(): string`
  - `hashSessionToken(token): string`
  - `hashThrottleKey(kind, value): string`
  - `userPublicSelect`
  - `toAuthUser(user): AuthUser`

- [ ] **Step 1: Define auth types**

Create:

```ts
export type AuthUser = {
  id: number;
  name: string;
  username: string;
  email: string;
};

export type LoginInput = {
  username: string;
  password: string;
  remember: boolean;
  next?: string;
};

export type LoginResponse = {
  message: string;
  data: {
    user: AuthUser;
    redirectTo: string;
  };
};
```

- [ ] **Step 2: Centralize constants**

Create constants for:

```ts
export const AUTH_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-admin_session" : "admin_session";
export const AUTH_COOKIE_NAMES = ["__Host-admin_session", "admin_session"] as const;
export const NORMAL_SESSION_SECONDS = 12 * 60 * 60;
export const REMEMBER_SESSION_SECONDS = 30 * 24 * 60 * 60;
export const THROTTLE_WINDOW_MS = 15 * 60 * 1000;
export const THROTTLE_MAX_FAILURES = 5;
export const SESSION_TOUCH_INTERVAL_MS = 5 * 60 * 1000;
```

Also export exact protected API prefixes:

```ts
[
  "/api/users",
  "/api/companies",
  "/api/skills",
  "/api/tags",
  "/api/project-highlights",
  "/api/experiences",
  "/api/projects",
  "/api/posts",
]
```

- [ ] **Step 3: Implement Password policy and Argon2id**

Create `passwordSchema`:

```ts
z.string()
  .min(15, "Password must be at least 15 characters.")
  .max(128, "Password may not be greater than 128 characters.")
```

Hash with:

```ts
hash(password, {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
})
```

`verifyPasswordOrDummy` must verify a module-level valid dummy hash when `encodedHash` is null so invalid usernames and passwordless Users follow the expensive verification path. Catch malformed stored hashes and return false without logging secrets.

- [ ] **Step 4: Implement session/throttle crypto**

Use Node Crypto:

```ts
export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashThrottleKey(kind: "username" | "ip", value: string) {
  return createHmac("sha256", getAuthSecret())
    .update(`${kind}:${value}`)
    .digest("hex");
}
```

`getAuthSecret()` throws a configuration error unless `AUTH_SECRET` has at least 32 characters.

- [ ] **Step 5: Add explicit User DTO**

Create:

```ts
export const userPublicSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const authUserSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
} satisfies Prisma.UserSelect;
```

Export inferred `PublicUser` and `toAuthUser`. Do not provide a serializer accepting an unrestricted Prisma User object.

- [ ] **Step 6: Verify and commit**

Run TypeScript, targeted ESLint, and diff check. Commit:

```bash
git add types/auth.d.ts lib/auth
git commit -m "feat: add authentication primitives"
```

---

### Task 3: Request security, database Session, and login throttle

**Files:**

- Create: `lib/auth/request.ts`
- Create: `lib/auth/session.ts`
- Create: `lib/auth/throttle.ts`
- Create: `lib/auth/authorize.ts`

**Interfaces:**

- Produces:
  - `validateSameOrigin(request): boolean`
  - `getClientAddress(request): string`
  - `getSafeRedirectPath(value): string`
  - `createUserSession(userId, remember): Promise<void>`
  - `getSessionUser(): Promise<AuthUser | null>`
  - `revokeCurrentSession(): Promise<void>`
  - `revokeUserSessions(userId): Promise<void>`
  - `getThrottleState(username, request)`
  - `recordLoginFailure(username, request): Promise<{ blocked: boolean; retryAfterSeconds: number }>`
  - `clearLoginThrottle(username, request)`
  - `requirePageUser(): Promise<AuthUser>`
  - `requireApiUser(request): Promise<AuthUser | NextResponse>`

- [ ] **Step 1: Implement request boundaries**

`getSafeRedirectPath` returns `/admin` unless the input begins with exactly one `/` and does not begin with `//`. `validateSameOrigin` returns true for GET/HEAD/OPTIONS; unsafe methods require a valid `Origin` whose origin equals `new URL(request.url).origin`.

Client-address precedence:

1. first `x-forwarded-for` entry;
2. `x-real-ip`;
3. `"unknown"`.

Trim and cap the value before hashing; never log or persist it.

- [ ] **Step 2: Implement Session lifecycle**

Session creation:

```ts
const token = createSessionToken();
const tokenHash = hashSessionToken(token);
const seconds = remember ? REMEMBER_SESSION_SECONDS : NORMAL_SESSION_SECONDS;
const expiresAt = new Date(Date.now() + seconds * 1000);
await prisma.session.create({ data: { tokenHash, userId, expiresAt } });
(await cookies()).set(AUTH_COOKIE_NAME, token, {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  ...(remember ? { maxAge: seconds, expires: expiresAt } : {}),
});
```

Verification hashes the cookie, queries a non-expired Session including `authUserSelect`, deletes an expired record opportunistically, and updates `lastSeenAt` only when older than five minutes. Use `cache()` only for the read verifier used in one render pass.

Logout deletes by token hash and expires both possible cookie names. User revocation deletes all rows by `userId`.

- [ ] **Step 3: Implement throttle state transitions**

For username and address hashes:

- a missing/expired window is unblocked;
- `blockedUntil > now` is blocked;
- failure in an expired window resets count to one;
- failure in an active window increments count;
- count five sets `blockedUntil = windowStartedAt + 15 minutes` and returns `blocked: true`;
- success deletes both buckets.

Use a Prisma transaction for both buckets. Export `retryAfterSeconds` for HTTP 429.

- [ ] **Step 4: Implement authorization**

`requirePageUser` redirects to `/login` when secure Session verification returns null.

`requireApiUser`:

1. rejects unsafe cross-origin requests with JSON 403;
2. verifies the database Session;
3. returns JSON 401 when missing;
4. otherwise returns `AuthUser`.

Also export:

```ts
export function isAuthErrorResponse(
  value: AuthUser | NextResponse,
): value is NextResponse
```

- [ ] **Step 5: Verify and commit**

Run TypeScript, targeted ESLint, and diff check. Commit:

```bash
git add lib/auth
git commit -m "feat: add database session security"
```

---

### Task 4: Login, session, and logout endpoints and services

**Files:**

- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/logout/route.ts`
- Create: `app/api/auth/session/route.ts`
- Create: `lib/services/auth/login.ts`
- Create: `lib/services/auth/logout.ts`

**Interfaces:**

- Consumes Tasks 2–3.
- Produces real auth HTTP flows and `useLogin`/`useLogout`.

- [ ] **Step 1: Implement Login endpoint**

Validate:

```ts
const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required.").max(255),
  password: z.string().min(1, "Password is required.").max(128),
  remember: z.boolean().default(false),
  next: z.string().optional(),
});
```

Require same-origin. Before User lookup, check both throttle buckets. Query normalized Username with `password: true` plus auth fields. Always run `verifyPasswordOrDummy`.

On invalid credentials, record failure and return:

```json
{
  "message": "Unable to sign in with those credentials."
}
```

Use 401, or 429 when blocked. On success clear throttle, create Session, and return `LoginResponse` with safe redirect. Add `Cache-Control: no-store`.

- [ ] **Step 2: Implement Logout and Session endpoints**

Logout requires same-origin, revokes the current Session when present, expires cookies even when the database record is already absent, and returns success with no-store.

Logout also returns `Clear-Site-Data: "cache"`; do not clear all storage because the public Theme preference must survive.

Session GET returns `{ message, data: AuthUser }` or 401, never a Prisma User.

- [ ] **Step 3: Add client mutations**

`useLogin` posts `LoginInput` and exposes field/generic errors. `useLogout` posts an empty object, clears all TanStack Query cache on success, and lets the caller redirect.

- [ ] **Step 4: Verify and commit**

Run TypeScript, ESLint, diff check. Commit:

```bash
git add app/api/auth lib/services/auth
git commit -m "feat: add authentication endpoints"
```

---

### Task 5: Real Login form

**Files:**

- Modify: `components/login/login-form.tsx`
- Modify: `app/login/page.tsx`

**Interfaces:**

- Consumes `useLogin`, `LoginInput`, and secure server Session read.
- Produces username/password Login UX and authenticated redirect.

- [ ] **Step 1: Replace the no-op form**

Change values to:

```ts
type LoginFormValues = {
  username: string;
  password: string;
  remember: boolean;
};
```

Render Username with `UserRound` icon and `autoComplete="username"`. Keep Password visibility and use `autoComplete="current-password"`. Submit through `useLogin`, disable duplicate submission, display generic Alert, and route to `response.data.redirectTo`.

Pass `next` into `LoginForm` from the server page; never read an arbitrary external URL client-side.

- [ ] **Step 2: Protect the Login page**

Make the page async, call the optional secure Session reader, redirect authenticated Users to `/admin`, normalize `searchParams.next` with `getSafeRedirectPath`, and render:

```tsx
<LoginForm next={safeNext} />
```

- [ ] **Step 3: Verify and commit**

Run TypeScript, ESLint, diff check. Commit:

```bash
git add components/login/login-form.tsx app/login/page.tsx
git commit -m "feat: connect admin login"
```

---

### Task 6: Proxy, protected Admin layout, account UI, and Logout

**Files:**

- Create: `proxy.ts`
- Modify: `app/admin/layout.tsx`
- Modify: `components/admin/admin-shell.tsx`
- Modify: `components/admin/admin-sidebar.tsx`
- Create: `components/admin/admin-account.tsx`

**Interfaces:**

- Consumes Task 3 page authorization and Task 4 Logout.
- Produces layered Admin protection and current-account UI.

- [ ] **Step 1: Add optimistic Proxy**

For `/admin/:path*`, accept either centralized dev/production cookie name. If neither exists, redirect to:

```ts
const login = new URL("/login", request.url);
login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
return NextResponse.redirect(login);
```

Do not redirect `/login` from Proxy based only on cookie presence.

Match protected API prefixes as well. For every Admin or protected-API request that continues, set `Cache-Control: private, no-store, max-age=0` on the response. Proxy does not replace the secure database check in route handlers.

- [ ] **Step 2: Secure Admin layout**

Make layout async:

```tsx
const user = await requirePageUser();
return <AdminShell user={user}>{children}</AdminShell>;
```

Use `connection()` or an equivalent request-time boundary and no-store metadata/headers behavior so protected HTML is not statically shared.

- [ ] **Step 3: Add account and Logout UI**

Pass `AuthUser` through AdminShell to AdminSidebar. `AdminAccount` renders Name, `@username`, and a Logout Button. Logout success uses `router.replace("/login")` and `router.refresh()`. Failure shows an inline generic error without exposing server detail.

- [ ] **Step 4: Verify and commit**

Run TypeScript, ESLint, build route type generation if required, and diff check. Commit:

```bash
git add proxy.ts app/admin/layout.tsx components/admin
git commit -m "feat: protect admin workspace"
```

---

### Task 7: Protect every content-management API

**Files:**

- Modify: all `route.ts` files under Users, Companies, Skills, Tags, Project Highlights, Experiences, Projects, and Posts.

**Interfaces:**

- Consumes `requireApiUser` and `isAuthErrorResponse`.
- Produces 401/403 protection for every content management operation.

- [ ] **Step 1: Add secure checks to every handler**

At the start of each exported GET/POST/PATCH/DELETE:

```ts
const authorization = await requireApiUser(request);
if (isAuthErrorResponse(authorization)) return authorization;
```

Rename `_request` to `request` where required. This call also performs Origin checks for unsafe methods.

Do not add this guard to:

- `/api/auth/*`;
- `/api/og`;
- public pages or server-side Blog data modules.

- [ ] **Step 2: Audit coverage**

Run:

```bash
for file in $(rg --files app/api/{users,companies,skills,tags,project-highlights,experiences,projects,posts} | sort); do
  rg -q "requireApiUser" "$file" || echo "MISSING $file"
done
```

Expected: no `MISSING` output.

- [ ] **Step 3: Verify and commit**

Run TypeScript, ESLint on protected routes, and diff check. Commit:

```bash
git add app/api
git commit -m "feat: protect content APIs"
```

---

### Task 8: Manage User Password fields and safe DTOs

**Files:**

- Modify: `lib/form/user-schema.ts`
- Modify: `app/api/users/route.ts`
- Modify: `app/api/users/[username]/route.ts`
- Modify: `app/admin/users/users-client-page.tsx`
- Modify: `lib/services/users/create-user.ts`
- Modify: `lib/services/users/update-user.ts`
- Modify: `lib/services/users/get-users.ts`

**Interfaces:**

- Consumes Password hash/revocation, AuthUser from API authorization, and safe User DTO.
- Produces secure User create/update/delete management.

- [ ] **Step 1: Split create and update contracts**

Define base fields, then:

```ts
export const createUserSchema = userFieldsSchema.extend({
  password: passwordSchema,
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  path: ["passwordConfirmation"],
  message: "Password confirmation does not match.",
});

export const updateUserSchema = userFieldsSchema.extend({
  password: z.union([passwordSchema, z.literal("")]).optional(),
  passwordConfirmation: z.string().optional(),
}).superRefine((data, context) => {
  const changing = Boolean(data.password || data.passwordConfirmation);
  if (changing && data.password !== data.passwordConfirmation) {
    context.addIssue({
      code: "custom",
      path: ["passwordConfirmation"],
      message: "Password confirmation does not match.",
    });
  }
});
```

Export input types. Confirmation never reaches Prisma.

- [ ] **Step 2: Secure User list and create**

List uses `select: userPublicSelect`.

Create:

1. authenticate/Origin-check;
2. validate create payload;
3. validate Username/Email uniqueness;
4. hash Password;
5. write `{ name, username, email, password: encodedHash }`;
6. return `{ message, data }` using `userPublicSelect`.

- [ ] **Step 3: Secure update and delete**

Update builds scalar data explicitly. When Password is present, hash it and perform User update plus `session.deleteMany({ userId })` in one transaction.

Delete checks:

```ts
if (currentUser.username === username) {
  return fieldOrManagementError("You cannot delete the account currently in use.");
}
if (await prisma.user.count() <= 1) {
  return fieldOrManagementError("The final User cannot be deleted.");
}
```

Then delete by Username. Never return `password`.

- [ ] **Step 4: Add Password fields to Manage User**

Create mode requires Password and Confirm Password. Edit mode labels them as optional and explains that blanks preserve the current Password. Both use visibility toggles and `autoComplete="new-password"`.

The update response includes `sessionRevoked: true` only when the authenticated User changed their own Password. The client immediately uses `router.replace("/login")` and `router.refresh()` for that response; other User edits remain on Manage User.

- [ ] **Step 5: Update services to safe DTOs**

Replace Prisma `User` response typing with `PublicUser`. Create uses `CreateUserInput`; update uses `UpdateUserInput`.

- [ ] **Step 6: Verify and commit**

Run TypeScript, ESLint, diff check, and inspect all User JSON serializers. Commit:

```bash
git add lib/form/user-schema.ts app/api/users app/admin/users lib/services/users
git commit -m "feat: add managed user passwords"
```

---

### Task 9: Hidden terminal bootstrap

**Files:**

- Create: `scripts/bootstrap-user-password.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes shared Password schema/hash and Prisma provider.
- Produces `npm run auth:bootstrap -- <username>`.

- [ ] **Step 1: Implement hidden input**

Require an interactive TTY. Read Username from one positional argument, but never accept Password as an argument or environment variable. Toggle raw stdin mode while collecting Password and Confirmation, print only newline characters, and restore terminal state in `finally`.

- [ ] **Step 2: Validate and update**

Flow:

```ts
const user = await prisma.user.findUnique({
  where: { username },
  select: { id: true, username: true },
});
if (!user) throw new Error("User not found.");
const parsed = passwordSchema.safeParse(password);
if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
if (password !== confirmation) throw new Error("Password confirmation does not match.");
const encodedHash = await hashPassword(password);
await prisma.$transaction([
  prisma.user.update({ where: { id: user.id }, data: { password: encodedHash } }),
  prisma.session.deleteMany({ where: { userId: user.id } }),
]);
```

Print only `"Password updated for @username."`.

- [ ] **Step 3: Add package script**

```json
"auth:bootstrap": "tsx scripts/bootstrap-user-password.ts"
```

- [ ] **Step 4: Verify and commit**

Run TypeScript, ESLint, and a non-TTY invocation that must fail safely without changing data. Commit:

```bash
git add scripts/bootstrap-user-password.ts package.json
git commit -m "feat: add user password bootstrap"
```

---

### Task 10: Rollout and security verification

**Files:**

- Modify only files proven defective by verification.

**Interfaces:**

- Consumes Tasks 1–9.
- Produces one bootstrapped User, verified protected Admin, and clean repository.

- [ ] **Step 1: Configure a local secret without committing it**

Ensure `.env` contains an `AUTH_SECRET` of at least 32 random characters. If absent, pause and ask the human to add a value generated locally with:

```bash
openssl rand -base64 32
```

The value is placed by the human in ignored `.env`, never pasted into chat, captured command output, source, or Git.

- [ ] **Step 2: Bootstrap the existing User**

List Username through a direct local database query without printing Email/Password. Run:

```bash
npm run auth:bootstrap -- <existing-username>
```

The human enters and confirms Password through the hidden prompt. Do not request the Password in chat.

- [ ] **Step 3: Run complete static verification**

```bash
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate status
npx tsc --noEmit --incremental false
npm run lint
git diff --check
npm run build
```

Expected: database up to date, all checks exit 0, Admin/Login/Auth routes appear in the build.

- [ ] **Step 4: Start production mode and verify unauthenticated boundaries**

Start on an unused port. Without cookies:

- `/admin` and each representative Admin detail route redirect to Login;
- Login remains 200;
- every protected resource GET returns 401;
- every protected mutation without Origin returns 403;
- `/`, `/blog`, published Blog detail where available, and `/api/og` remain public.

- [ ] **Step 5: Verify credential and throttle behavior**

Use a cookie jar kept under `/tmp`:

- missing Username, passwordless Username, and wrong Password all return the same generic 401;
- failures one through four return 401;
- the fifth failure and subsequent attempts return 429;
- no response reveals User existence;
- successful login after clearing/waiting throttle returns safe DTO and sets the expected cookie attributes.

Use a separate temporary throttle identifier so the real bootstrapped account is not locked during the successful-login check.

- [ ] **Step 6: Verify Session and redirect behavior**

With the authenticated cookie:

- `/admin` returns 200;
- `/api/auth/session` returns only the safe DTO;
- protected APIs return their normal responses;
- `/login` redirects to `/admin`;
- internal `next=/admin/posts` is honored;
- `next=//evil.example` and absolute external URLs resolve to `/admin`;
- forged, expired, and deleted Session tokens return 401/redirect;
- Logout deletes the Session and subsequent requests become unauthenticated.

- [ ] **Step 7: Verify Manage User security**

Using temporary Users that are deleted afterward:

- create rejects Password below 15, above 128, or mismatched confirmation;
- create stores an Argon2id encoded value and never returns it;
- blank edit preserves hash;
- Password edit changes hash and revokes that User's Sessions;
- self-delete is rejected;
- deleting the final User is rejected;
- all temporary records and Sessions are removed.

- [ ] **Step 8: Inspect secret leakage**

Search code/build/runtime outputs:

```bash
rg -n "password|tokenHash|admin_session" app components lib types scripts \
  --glob '*.{ts,tsx}'
```

Review every match. Confirm no response spreads unrestricted User objects and no console statement logs credentials, hashes, or raw tokens.

- [ ] **Step 9: Final state**

Stop server and run:

```bash
npx prisma migrate status
git status --short
git diff --check
git log -12 --oneline
```

Expected: database is up to date, smoke data is removed, working tree is clean, and all implementation batches are committed. Automated tests remain intentionally unrun.
