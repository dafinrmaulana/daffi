import "dotenv/config";
import { hashPassword, passwordSchema } from "@/lib/auth/password";
import prisma from "@/lib/providers/prisma";

async function readHidden(prompt: string) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "Password bootstrap requires an interactive terminal.",
    );
  }

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

async function main() {
  const username = process.argv[2]?.trim().toLowerCase();

  if (!username) {
    throw new Error(
      "Usage: npm run auth:bootstrap -- <username>",
    );
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "Password bootstrap requires an interactive terminal.",
    );
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true },
  });

  if (!user) {
    throw new Error("User not found.");
  }

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

  const encodedHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: encodedHash },
    }),
    prisma.session.deleteMany({
      where: { userId: user.id },
    }),
  ]);

  process.stdout.write(`Password updated for @${user.username}.\n`);
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
