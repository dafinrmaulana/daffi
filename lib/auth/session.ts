import { cache } from "react";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_NAMES,
  NORMAL_SESSION_SECONDS,
  REMEMBER_SESSION_SECONDS,
  SESSION_TOUCH_INTERVAL_MS,
} from "@/lib/auth/constants";
import {
  createSessionToken,
  hashSessionToken,
} from "@/lib/auth/crypto";
import {
  authUserSelect,
  toAuthUser,
} from "@/lib/auth/user-dto";
import prisma from "@/lib/providers/prisma";

function getSessionCookieValue(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  for (const name of AUTH_COOKIE_NAMES) {
    const value = cookieStore.get(name)?.value;

    if (value) {
      return value;
    }
  }

  return null;
}

async function deleteSessionCookies() {
  const cookieStore = await cookies();

  for (const name of AUTH_COOKIE_NAMES) {
    cookieStore.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });
  }
}

export async function createUserSession(
  userId: number,
  remember: boolean,
) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const seconds = remember
    ? REMEMBER_SESSION_SECONDS
    : NORMAL_SESSION_SECONDS;
  const expiresAt = new Date(Date.now() + seconds * 1000);

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: seconds, expires: expiresAt } : {}),
  });
}

async function readSessionUser() {
  const cookieStore = await cookies();
  const token = getSessionCookieValue(cookieStore);

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      expiresAt: true,
      lastSeenAt: true,
      user: {
        select: authUserSelect,
      },
    },
  });

  if (!session) {
    return null;
  }

  const now = new Date();

  if (session.expiresAt <= now) {
    await prisma.session.deleteMany({ where: { id: session.id } });
    return null;
  }

  if (
    now.getTime() - session.lastSeenAt.getTime() >=
    SESSION_TOUCH_INTERVAL_MS
  ) {
    await prisma.session.updateMany({
      where: {
        id: session.id,
        lastSeenAt: session.lastSeenAt,
      },
      data: { lastSeenAt: now },
    });
  }

  return toAuthUser(session.user);
}

export const getSessionUser = cache(readSessionUser);

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const token = getSessionCookieValue(cookieStore);

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  await deleteSessionCookies();
}

export async function revokeUserSessions(userId: number) {
  await prisma.session.deleteMany({ where: { userId } });
}

export async function clearSessionCookies() {
  await deleteSessionCookies();
}
