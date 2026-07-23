import type { Prisma } from "@/prisma/generated/prisma/client";
import {
  THROTTLE_MAX_FAILURES,
  THROTTLE_WINDOW_MS,
} from "@/lib/auth/constants";
import { hashThrottleKey } from "@/lib/auth/crypto";
import { getClientAddress } from "@/lib/auth/request";
import prisma from "@/lib/providers/prisma";

type ThrottleResult = {
  blocked: boolean;
  retryAfterSeconds: number;
};

function getThrottleKeys(username: string, request: Request) {
  return [
    hashThrottleKey(
      "username",
      username.trim().toLowerCase().slice(0, 256),
    ),
    hashThrottleKey("ip", getClientAddress(request)),
  ];
}

function getRetryAfterSeconds(blockedUntil: Date, now: Date) {
  return Math.max(
    1,
    Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000),
  );
}

export async function getThrottleState(
  username: string,
  request: Request,
): Promise<ThrottleResult> {
  const now = new Date();
  const buckets = await prisma.loginThrottle.findMany({
    where: { keyHash: { in: getThrottleKeys(username, request) } },
    select: { blockedUntil: true },
  });
  const activeBlocks = buckets
    .map((bucket) => bucket.blockedUntil)
    .filter((date): date is Date => Boolean(date && date > now));

  if (activeBlocks.length === 0) {
    return { blocked: false, retryAfterSeconds: 0 };
  }

  const blockedUntil = new Date(
    Math.max(...activeBlocks.map((date) => date.getTime())),
  );

  return {
    blocked: true,
    retryAfterSeconds: getRetryAfterSeconds(blockedUntil, now),
  };
}

async function recordBucketFailure(
  transaction: Prisma.TransactionClient,
  keyHash: string,
  now: Date,
) {
  await transaction.$queryRaw`
    SELECT pg_advisory_xact_lock(hashtext(${keyHash}))
  `;

  const bucket = await transaction.loginThrottle.findUnique({
    where: { keyHash },
  });
  const windowExpired =
    !bucket ||
    now.getTime() - bucket.windowStartedAt.getTime() >=
      THROTTLE_WINDOW_MS;
  const windowStartedAt = windowExpired
    ? now
    : bucket.windowStartedAt;
  const failureCount = windowExpired ? 1 : bucket.failureCount + 1;
  const blockedUntil =
    failureCount >= THROTTLE_MAX_FAILURES
      ? new Date(windowStartedAt.getTime() + THROTTLE_WINDOW_MS)
      : null;

  return transaction.loginThrottle.upsert({
    where: { keyHash },
    create: {
      keyHash,
      failureCount,
      windowStartedAt,
      blockedUntil,
    },
    update: {
      failureCount,
      windowStartedAt,
      blockedUntil,
    },
    select: { blockedUntil: true },
  });
}

export async function recordLoginFailure(
  username: string,
  request: Request,
): Promise<ThrottleResult> {
  const now = new Date();
  const keys = getThrottleKeys(username, request);
  const buckets = await prisma.$transaction(async (transaction) => {
    const results: Awaited<
      ReturnType<typeof recordBucketFailure>
    >[] = [];

    for (const keyHash of keys) {
      results.push(
        await recordBucketFailure(transaction, keyHash, now),
      );
    }

    return results;
  });
  const activeBlocks = buckets
    .map((bucket) => bucket.blockedUntil)
    .filter((date): date is Date => Boolean(date && date > now));

  if (activeBlocks.length === 0) {
    return { blocked: false, retryAfterSeconds: 0 };
  }

  const blockedUntil = new Date(
    Math.max(...activeBlocks.map((date) => date.getTime())),
  );

  return {
    blocked: true,
    retryAfterSeconds: getRetryAfterSeconds(blockedUntil, now),
  };
}

export async function clearLoginThrottle(
  username: string,
  request: Request,
) {
  await prisma.loginThrottle.deleteMany({
    where: { keyHash: { in: getThrottleKeys(username, request) } },
  });
}
