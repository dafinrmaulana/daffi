import { NextResponse } from "next/server";

import { getPublicPost } from "@/lib/data/public-posts";
import type { RouteContext } from "@/types/api";

export async function GET(
  _request: Request,
  context: RouteContext<{ slug: string }>,
) {
  try {
    const { slug } = await context.params;
    const post = await getPublicPost(slug);

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: post });
  } catch (error) {
    console.error("Failed to get public post", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
