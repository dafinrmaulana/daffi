import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAMES,
  PROTECTED_API_PREFIXES,
} from "@/lib/auth/constants";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isProtectedApi = PROTECTED_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const hasSessionCookie = AUTH_COOKIE_NAMES.some((name) =>
    Boolean(request.cookies.get(name)?.value),
  );

  if (isAdmin && !hasSessionCookie) {
    const login = new URL("/login", request.url);
    login.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    return NextResponse.redirect(login);
  }

  const response = NextResponse.next();

  if (isAdmin || isProtectedApi) {
    response.headers.set(
      "Cache-Control",
      "private, no-store, max-age=0",
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/users/:path*",
    "/api/companies/:path*",
    "/api/skills/:path*",
    "/api/tags/:path*",
    "/api/project-highlights/:path*",
    "/api/experiences/:path*",
    "/api/projects/:path*",
    "/api/posts/:path*",
  ],
};
