import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/types/auth";
import { getSessionUser } from "@/lib/auth/session";
import { validateSameOrigin } from "@/lib/auth/request";

function noStoreJson(
  body: { message: string },
  status: number,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

export async function requirePageUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireApiUser(
  request: Request,
): Promise<AuthUser | NextResponse> {
  if (!validateSameOrigin(request)) {
    return noStoreJson({ message: "Forbidden." }, 403);
  }

  const user = await getSessionUser();

  if (!user) {
    return noStoreJson({ message: "Authentication required." }, 401);
  }

  return user;
}

export function isAuthErrorResponse(
  value: AuthUser | NextResponse,
): value is NextResponse {
  return value instanceof NextResponse;
}
