# Admin Authentication Design

## Summary

Add real username/password authentication to the existing portfolio admin before building the analytics dashboard. Every User is an administrator who can manage all content. Authentication uses Argon2id password hashes, revocable database sessions, secure HTTP-only cookies, login throttling, layered route/API protection, safe User DTOs, and a one-time terminal bootstrap for the existing passwordless User.

## Goals

- Authenticate existing and future Users with username and password.
- Treat every authenticated User as a full content administrator without roles.
- Protect all `/admin` pages and content-management APIs.
- Use revocable database sessions rather than long-lived stateless JWTs.
- Support browser-session login and an explicit 30-day Remember me mode.
- Add Password and Confirm Password controls to Manage User.
- Prevent password hashes and session secrets from leaving the server.
- Prevent common lockout paths such as deleting the current or last User.
- Rate-limit failed login attempts without storing raw IP addresses.
- Provide a safe one-time bootstrap path for the existing User.

## Non-goals

- Roles or granular permissions.
- Public self-registration.
- Email verification, password-reset email, magic links, OAuth, passkeys, or MFA.
- Device/session management UI.
- Analytics collection or dashboard implementation in this phase.
- Automated tests while the project test suite is intentionally being rebuilt.

## Accepted account model

Every `User` record represents a content administrator. A User with a valid password can log in and perform every content-management action. There is no `role` column and no authorization distinction between authenticated Users.

Public registration does not exist. New Users are created only from the protected Manage User interface by an already authenticated User.

## Prisma data model

### User

Add:

```prisma
password String?
sessions Session[]
```

The column is intentionally named `password` per the accepted project convention, but its stored value is always an Argon2id encoded hash. Plaintext passwords are never persisted.

`password` is nullable to migrate the one existing User safely. A User with `password = null` cannot authenticate. Every newly created User must have a valid password.

### Session

Add a `Session` model containing:

- `id`: internal integer primary key.
- `tokenHash`: unique SHA-256 hash of the raw random session token.
- `userId`: required User relation with cascade delete.
- `expiresAt`: absolute server-side expiry.
- `lastSeenAt`: most recent successful secure session verification.
- `createdAt`: creation timestamp.

Only the random raw token is sent to the browser. Only its hash is stored in PostgreSQL. A database leak therefore does not directly expose reusable session tokens.

### LoginThrottle

Add a `LoginThrottle` model containing:

- `id`: internal integer primary key.
- `keyHash`: unique keyed hash identifying one normalized username bucket or one IP bucket.
- `failureCount`: current failed-attempt count.
- `windowStartedAt`: beginning of the active 15-minute window.
- `blockedUntil`: optional lock expiry.
- `updatedAt`: cleanup and diagnostics timestamp.

The application derives `keyHash` using a server secret and never persists raw usernames or IP addresses in the throttle table. Username and IP buckets are evaluated independently; either blocked bucket rejects the attempt.

## Password policy and hashing

Passwords:

- are required for new Users;
- must be 15–128 Unicode characters;
- may contain spaces and passphrases;
- have no mandatory uppercase, number, or symbol composition rule;
- are never silently truncated;
- are confirmed through a separate form-only `passwordConfirmation` value.

Use Argon2id with the OWASP minimum profile of 19 MiB memory, two iterations, and one lane, provided production performance verification remains acceptable. Each encoded hash includes its unique salt and parameters.

Password verification always uses the Argon2 library's verification API. Login responses never disclose whether the username is missing, the password is wrong, or the User has not yet been bootstrapped.

References:

- [NIST SP 800-63B password requirements](https://pages.nist.gov/800-63-4/sp800-63b.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

## Session lifecycle

### Token and cookie

Create a cryptographically random token with at least 256 bits of entropy. Store its SHA-256 hash in `Session` and its raw value only in a cookie.

Cookie settings:

- `HttpOnly: true`;
- `SameSite: "lax"`;
- `Secure: true` in production;
- `Path: "/"`;
- no `Domain`;
- a browser-session cookie when Remember me is false;
- a 30-day `Max-Age`/expiry when Remember me is true.

The database always enforces an absolute expiry:

- 12 hours for a normal login;
- 30 days for Remember me.

The cookie name is centralized so Proxy, route handlers, and session helpers cannot drift. Authentication tokens are never stored in `localStorage` or `sessionStorage`.

### Creation

Successful login:

1. validates the payload;
2. checks username and IP throttle buckets;
3. retrieves the User using normalized username;
4. verifies the Argon2id hash or performs a dummy verification when the User/hash is missing;
5. clears relevant throttle buckets;
6. generates a new raw token;
7. stores only its hash and expiry;
8. sets the secure cookie;
9. redirects to a validated internal destination.

### Verification

Secure verification hashes the cookie token, retrieves a non-expired Session with its User, and returns a minimal authenticated User DTO. Expired or missing sessions are rejected and their cookies are cleared where the response boundary permits.

`lastSeenAt` updates at a throttled interval rather than on every request to avoid unnecessary database writes.

### Revocation

- Logout deletes the current Session and expires the cookie.
- Password change deletes every Session belonging to that User.
- User deletion cascades to all Session records.
- Expired Sessions are rejected immediately and may be deleted opportunistically.

References:

- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

## Login throttling

Allow at most five failed attempts in a 15-minute window for both:

- the normalized username bucket;
- the request IP bucket.

The fifth failed attempt sets `blockedUntil` to the end of the 15-minute window. A blocked request returns HTTP 429 with the same generic form message regardless of which bucket triggered it. Successful authentication clears the related buckets.

Use a keyed hash based on an authentication secret for throttle identifiers. Proxy headers are accepted only through one centralized resolver with a documented trusted-host precedence. Raw request IP, raw username, submitted password, session token, and password hash are never logged.

## Authentication interfaces

### Routes

- `POST /api/auth/login`: username/password/remember login.
- `POST /api/auth/logout`: revoke current session and clear cookie.
- `GET /api/auth/session`: return the minimal authenticated User DTO or 401.

No signup endpoint is exposed publicly.

### Login form

The existing `/login` layout remains. Its form changes to:

- Username;
- Password with visibility toggle;
- Remember me;
- submit feedback and generic authentication error.

The client sends credentials directly to the login endpoint. Password is never placed in a URL, query key, persistent browser store, or global state.

Successful login redirects to `/admin` unless a safe `next` query parameter exists. A valid `next` value must begin with one `/`, must not begin with `//`, and must resolve within the same origin.

An authenticated User opening `/login` is redirected to `/admin`.

### Logout

The admin sidebar displays the authenticated User's name and username with a Logout action. Logout disables duplicate submission, revokes the Session, clears the cookie, and redirects to `/login`.

## Layered protection

### Proxy

Add a root `proxy.ts` for an optimistic cookie-presence check:

- unauthenticated `/admin` requests redirect to `/login?next=<internal-path>`;
- `/login` always reaches its server-side database session check, preventing forged-cookie redirect loops;
- public routes and static assets remain unaffected.

Proxy is a UX/performance boundary, not the security authority.

### Admin layout and data access layer

`app/admin/layout.tsx` calls a server-only cached session verifier. Missing, expired, deleted, or otherwise invalid database sessions redirect to Login.

The verifier returns only:

- `id`;
- `name`;
- `username`;
- `email`.

### Route handlers

Every handler under these content-management resources verifies a live database session:

- Users;
- Companies;
- Skills;
- Tags;
- Project Highlights;
- Experiences;
- Projects;
- Posts.

Unauthenticated requests return HTTP 401 JSON rather than a redirect. `/api/auth/login`, `/api/auth/logout`, public pages, Blog server queries, and `/api/og` remain public.

The authorization helper is centralized and reusable by the later analytics dashboard APIs.

### CSRF and cache handling

Unsafe same-origin API requests validate `Origin` against the application origin. Cookies use SameSite Lax as an additional layer.

Authentication responses and protected admin responses use `Cache-Control: no-store`. Logout also clears browser cache/storage through a narrowly scoped `Clear-Site-Data` header where supported without clearing unrelated persistent theme preferences.

## Manage User changes

### Create

Create User requires:

- Name;
- Username;
- Email;
- Password;
- Confirm Password.

The API validates confirmation, hashes Password, writes the User, and returns a User DTO without Password.

### Edit

Edit User keeps Password and Confirm Password optional:

- both blank: preserve the existing hash;
- either supplied: both are required, must match, and must pass policy;
- successful password change revokes all Sessions for the edited User.

If the current User changes their own password, their current Session is revoked and the client returns to Login after the successful response.

### Delete guards

- The authenticated User cannot delete their own account.
- The final remaining User cannot be deleted.
- Known guard failures return HTTP 422 with a clear management-facing message.

All User list/create/update responses use an explicit DTO. No Prisma User object containing `password` is serialized directly.

## Existing User bootstrap

Provide a terminal command that:

1. accepts a username;
2. verifies that the User exists;
3. prompts for Password and confirmation without echoing input;
4. applies the same validation and Argon2id hashing as Manage User;
5. updates only the encoded `password`;
6. revokes existing Sessions for that User;
7. reports success without printing credentials or the hash.

The command does not create arbitrary Users and does not accept Password through a command-line argument, preventing shell-history leakage.

## Error handling

- Invalid payload: HTTP 422 with field errors.
- Invalid credentials: HTTP 401 with one generic message.
- Active throttle: HTTP 429 with one generic message and retry timing.
- Missing/expired session: HTTP 401 for APIs or redirect for admin pages.
- CSRF/origin failure: HTTP 403.
- Manage User uniqueness conflicts: HTTP 422 on Username or Email.
- Self-delete/last-user guard: HTTP 422.
- Unexpected failures: generic HTTP 500 response; server logs exclude all secrets.

Login performs a dummy Argon2 verification for missing/passwordless Users to reduce username-enumeration timing differences.

## Migration and rollout

1. Install the selected Node-compatible Argon2id package.
2. Add nullable `User.password`, `Session`, and `LoginThrottle`.
3. Create and apply a normal Prisma migration; do not use migrate-fresh.
4. Generate the Prisma client.
5. Deploy/bootstrap at least one existing User password before relying on the protected admin.
6. Enable login, layered admin protection, and protected APIs.
7. Confirm the bootstrapped User can authenticate before ending the rollout.

The nullable field remains necessary for safe legacy migration, but Manage User never permits creation of another passwordless User.

## Verification

No automated tests are added or run during this refactor. Verification consists of:

- dependency installation and lockfile integrity;
- Prisma format, validate, migration status, and client generation;
- TypeScript, ESLint, and production build;
- bootstrap prompt and stored Argon2id hash verification without printing it;
- correct and incorrect username/password behavior;
- equivalent missing/passwordless/wrong-password responses;
- fifth-failure throttle and 15-minute bucket behavior;
- normal 12-hour and Remember me 30-day session behavior;
- secure cookie attributes in production mode;
- safe internal redirect and rejection of external/protocol-relative destinations;
- authenticated Login redirect;
- logout server revocation and cookie deletion;
- expired, deleted, and forged session rejection;
- direct unauthenticated requests to every admin page and protected API;
- same-origin mutation acceptance and cross-origin rejection;
- User create/edit password validation;
- password-change session revocation;
- current-user and last-user delete guards;
- inspection that API bodies, logs, query keys, and generated HTML never expose Password, hash, or session token;
- final database and Git cleanliness checks.

## Accepted decisions

- Authentication is implemented before analytics.
- Every authenticated User is a full content administrator; no roles exist.
- Login uses Username and Password.
- The database column is named `password` but stores only an Argon2id encoded hash.
- Existing passwordless User is migrated safely and bootstrapped through a hidden terminal prompt.
- Sessions are database-backed and revocable.
- Default session lasts at most 12 hours; Remember me lasts at most 30 days.
- Five failed attempts in 15 minutes trigger a temporary username/IP throttle.
- Passwords are 15–128 characters with no composition rule.
- All content-management APIs are protected in addition to admin pages.
- Automated tests remain deferred.
