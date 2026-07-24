import { NextResponse } from "next/server";

import { getPublicProject } from "@/lib/data/public-projects";
import type { RouteContext } from "@/types/api";

export async function GET(
  _request: Request,
  context: RouteContext<{ slug: string }>,
) {
  try {
    const { slug } = await context.params;
    const project = await getPublicProject(slug);

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error("Failed to get public project", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
