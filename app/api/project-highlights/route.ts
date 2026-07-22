import { projectHighlightSchema } from "@/lib/form/project-highlight-schema";
import prisma from "@/lib/providers/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));
    const search = searchParams.get("search")?.trim();

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [{ name: { contains: search, mode: "insensitive" as const } }],
        }
      : {};

    const [projectHighlights, total] = await Promise.all([
      prisma.projectHighlight.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),

      prisma.projectHighlight.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: projectHighlights,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = projectHighlightSchema.parse(body);

    const existingProjectHighlight = await prisma.projectHighlight.findUnique({
      where: {
        name: validatedData.name,
      },
      select: {
        name: true,
      },
    });

    if (existingProjectHighlight) {
      return Response.json(
        {
          message: "Validation failed",
          errors: {
            name: ["Name is already taken"],
          },
        },
        { status: 422 },
      );
    }

    const projectHighlight = await prisma.projectHighlight.create({
      data: validatedData,
    });

    return NextResponse.json(
      {
        message: "Project highlight created successfully",
        data: projectHighlight,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          message: "Validation failed",
          errors: z.flattenError(error).fieldErrors,
        },
        { status: 422 },
      );
    }

    return Response.json(
      {
        message: "Internal server error",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
