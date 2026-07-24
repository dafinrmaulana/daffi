import { NextResponse } from "next/server";

import { getPublicPagination } from "@/lib/data/public-pagination";
import { listPublicPosts } from "@/lib/data/public-posts";

export async function GET(request: Request) {
  try {
    const { page, limit } = getPublicPagination(
      new URL(request.url).searchParams,
    );
    const response = await listPublicPosts({ page, limit });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to list public posts", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
