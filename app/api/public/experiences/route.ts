import { NextResponse } from "next/server";

import { listPublicExperiences } from "@/lib/data/public-experiences";
import { getPublicPagination } from "@/lib/data/public-pagination";

export async function GET(request: Request) {
  try {
    const { page, limit } = getPublicPagination(
      new URL(request.url).searchParams,
    );
    const response = await listPublicExperiences({ page, limit });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to list public experiences", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
