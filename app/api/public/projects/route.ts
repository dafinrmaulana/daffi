import { NextResponse } from "next/server";

import { getPublicPagination } from "@/lib/data/public-pagination";
import { listPublicProjects } from "@/lib/data/public-projects";

export async function GET(request: Request) {
  try {
    const { page, limit } = getPublicPagination(
      new URL(request.url).searchParams,
    );
    const response = await listPublicProjects({ page, limit });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to list public projects", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
