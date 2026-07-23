import { NextResponse } from "next/server";
import { validateSameOrigin } from "@/lib/auth/request";
import { revokeCurrentSession } from "@/lib/auth/session";

const HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Clear-Site-Data": '"cache"',
};

export async function POST(request: Request) {
  if (!validateSameOrigin(request)) {
    return NextResponse.json(
      { message: "Forbidden." },
      { status: 403, headers: HEADERS },
    );
  }

  await revokeCurrentSession();

  return NextResponse.json(
    { message: "Signed out successfully." },
    { headers: HEADERS },
  );
}
