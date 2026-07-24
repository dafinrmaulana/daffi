import { NextResponse } from "next/server";

import { getPublicPagination } from "@/lib/data/public-pagination";
import { listPublicSkills } from "@/lib/data/public-skills";

export async function GET(request: Request) {
  try {
    const { page, limit } = getPublicPagination(
      new URL(request.url).searchParams,
    );
    const response = await listPublicSkills({ page, limit });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to list public skills", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
