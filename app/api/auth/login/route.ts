import { NextResponse } from "next/server";
import { z } from "zod";
import { createUserSession } from "@/lib/auth/session";
import {
  clearLoginThrottle,
  getThrottleState,
  recordLoginFailure,
} from "@/lib/auth/throttle";
import { getSafeRedirectPath, validateSameOrigin } from "@/lib/auth/request";
import { verifyPasswordOrDummy } from "@/lib/auth/password";
import {
  authUserSelect,
  toAuthUser,
} from "@/lib/auth/user-dto";
import prisma from "@/lib/providers/prisma";
import type { LoginResponse } from "@/types/auth";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required.").max(255),
  password: z.string().min(1, "Password is required.").max(128),
  remember: z.boolean().default(false),
  next: z.string().optional(),
});

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
};
const INVALID_CREDENTIALS_MESSAGE =
  "Unable to sign in with those credentials.";

function invalidCredentialsResponse(
  status: 401 | 429,
  retryAfterSeconds = 0,
) {
  return NextResponse.json(
    { message: INVALID_CREDENTIALS_MESSAGE },
    {
      status,
      headers: {
        ...NO_STORE_HEADERS,
        ...(status === 429
          ? { "Retry-After": String(retryAfterSeconds) }
          : {}),
      },
    },
  );
}

export async function POST(request: Request) {
  if (!validateSameOrigin(request)) {
    return NextResponse.json(
      { message: "Forbidden." },
      { status: 403, headers: NO_STORE_HEADERS },
    );
  }

  let input: z.infer<typeof loginSchema>;

  try {
    input = loginSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: z.flattenError(error).fieldErrors,
        },
        { status: 422, headers: NO_STORE_HEADERS },
      );
    }

    return NextResponse.json(
      { message: "Invalid request." },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const username = input.username.toLowerCase();
  const throttle = await getThrottleState(username, request);

  if (throttle.blocked) {
    return invalidCredentialsResponse(
      429,
      throttle.retryAfterSeconds,
    );
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      ...authUserSelect,
      password: true,
    },
  });
  const passwordValid = await verifyPasswordOrDummy(
    user?.password ?? null,
    input.password,
  );

  if (!user || !passwordValid) {
    const failure = await recordLoginFailure(username, request);

    return invalidCredentialsResponse(
      failure.blocked ? 429 : 401,
      failure.retryAfterSeconds,
    );
  }

  await clearLoginThrottle(username, request);
  await createUserSession(user.id, input.remember);

  const response: LoginResponse = {
    message: "Signed in successfully.",
    data: {
      user: toAuthUser(user),
      redirectTo: getSafeRedirectPath(input.next),
    },
  };

  return NextResponse.json(response, {
    headers: NO_STORE_HEADERS,
  });
}
