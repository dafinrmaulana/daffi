# Production User Bootstrap Design

## Goal

Extend the existing `auth:bootstrap` command so it can safely provision
the first content-management User in an empty production database while
retaining its current password-reset behavior for existing Users.

## Command

The command remains:

```bash
npm run auth:bootstrap -- <username>
```

The username is required as the only positional argument and is
normalized to lowercase. Passwords are never accepted through command
arguments or environment variables.

## Behavior

The command queries the requested username and the total User count
before choosing one of three flows:

### Existing User

When the requested username exists, the command asks for a new Password
and Password Confirmation using hidden terminal input. After validation,
it updates the encoded Argon2id password and revokes every Session owned
by that User in one database transaction.

### Empty Database

When the requested username does not exist and the User count is zero,
the command prompts for:

- Name using visible terminal input;
- Email using visible terminal input;
- Password using hidden terminal input;
- Password Confirmation using hidden terminal input.

Name and Email are validated with the shared User rules. Password is
validated with the shared 15–128-character Password policy. The command
creates the first User with the normalized username and encoded
Argon2id password.

User creation is performed in a transaction. A concurrent provisioning
attempt is serialized with the same PostgreSQL advisory lock used by the
final-User deletion guard. After obtaining the lock, the transaction
checks that the database is still empty before creating the User.

### Non-empty Database and Unknown Username

When the requested username is absent but at least one User already
exists, the command refuses to create another User. It prints a concise
error and the available usernames so the operator can rerun the command
against the intended account. Names, emails, password hashes, and other
User fields are not printed.

## Input and Terminal Safety

The command requires an interactive stdin and stdout TTY. Visible and
hidden prompt helpers restore terminal state in `finally` blocks and
support cancellation. Hidden input never echoes Password characters.

Empty Name or invalid Email values are rejected before database writes.
Password validation and hashing reuse `passwordSchema` and
`hashPassword`. The `.env` file continues to be loaded before Prisma is
initialized.

## Output and Errors

Successful first-User creation prints:

```text
User @username created.
```

Successful password reset keeps the existing output:

```text
Password updated for @username.
```

Expected validation, missing-user, concurrency, and configuration
failures produce concise messages without exposing Passwords, hashes,
database URLs, or `AUTH_SECRET`.

## Scope

This change only modifies the terminal bootstrap workflow. It does not
add roles, public registration, invitation flows, or HTTP provisioning
endpoints. All authenticated Users remain able to manage content.

## Verification

No automated tests are added or run, following the current large-refactor
testing decision. Verification consists of:

- TypeScript compilation;
- ESLint;
- production build;
- non-TTY rejection before database mutation;
- interactive lookup of a nonexistent username in a non-empty database,
  confirming the safe refusal and username-only output;
- `git diff --check`.
