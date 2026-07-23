import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

const HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
};

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { message: "Authentication required." },
      { status: 401, headers: HEADERS },
    );
  }

  return NextResponse.json(
    {
      message: "Session retrieved successfully.",
      data: user,
    },
    { headers: HEADERS },
  );
}
