import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { hashPassword, passwordSchema } from "@/lib/auth/password";
import { USER_MANAGEMENT_LOCK_KEY } from "@/lib/auth/user-management";
import { userFieldsSchema } from "@/lib/form/user-schema";
import prisma from "@/lib/providers/prisma";

function requireInteractiveTerminal() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "Password bootstrap requires an interactive terminal.",
    );
  }
}

async function readVisible(prompt: string) {
  requireInteractiveTerminal();

  const terminal = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const abortController = new AbortController();
  const handleCancel = () => abortController.abort();

  terminal.once("SIGINT", handleCancel);

  try {
    return (
      await terminal.question(prompt, {
        signal: abortController.signal,
      })
    ).trim();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("User bootstrap cancelled.");
    }

    throw error;
  } finally {
    terminal.off("SIGINT", handleCancel);
    terminal.close();
  }
}

async function readHidden(prompt: string) {
  requireInteractiveTerminal();

  const input = process.stdin;
  const previousRawMode = input.isRaw;
  let value = "";

  process.stdout.write(prompt);
  input.setEncoding("utf8");
  input.resume();
  input.setRawMode(true);

  try {
    return await new Promise<string>((resolve, reject) => {
      const handleData = (chunk: string) => {
        for (const character of chunk) {
          if (character === "\u0003") {
            input.off("data", handleData);
            reject(new Error("Password bootstrap cancelled."));
            return;
          }

          if (character === "\r" || character === "\n") {
            input.off("data", handleData);
            resolve(value);
            return;
          }

          if (
            character === "\u007f" ||
            character === "\b"
          ) {
            value = value.slice(0, -1);
            continue;
          }

          value += character;
        }
      };

      input.on("data", handleData);
    });
  } finally {
    input.setRawMode(previousRawMode);
    input.pause();
    process.stdout.write("\n");
  }
}

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

async function main() {
  const argumentsList = process.argv.slice(2);
  const username = argumentsList[0]?.trim().toLowerCase();

  if (!username || argumentsList.length !== 1) {
    throw new Error(
      "Usage: npm run auth:bootstrap -- <username>",
    );
  }

  requireInteractiveTerminal();

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true },
  });

  if (user) {
    await resetPassword(user);
    return;
  }

  const availableUsers = await prisma.user.findMany({
    select: { username: true },
    orderBy: { username: "asc" },
  });

  if (availableUsers.length > 0) {
    const usernames = availableUsers
      .map(({ username: availableUsername }) => `@${availableUsername}`)
      .join(", ");

    throw new Error(
      `User not found. Available usernames: ${usernames}`,
    );
  }

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
}

main()
  .catch((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "Password bootstrap failed.";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
