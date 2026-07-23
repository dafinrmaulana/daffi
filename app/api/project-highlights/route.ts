import { projectHighlightSchema } from "@/lib/form/project-highlight-schema";
import { isAuthErrorResponse, requireApiUser } from "@/lib/auth/authorize";
import prisma from "@/lib/providers/prisma";
import { normalizeSlug } from "@/lib/slug";
import { Prisma } from "@/prisma/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(request: NextRequest) {
  const authorization = await requireApiUser(request);
  if (isAuthErrorResponse(authorization)) return authorization;

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
  const authorization = await requireApiUser(request);
  if (isAuthErrorResponse(authorization)) return authorization;

  try {
    const body = await request.json();
    const validatedData = projectHighlightSchema.parse(body);
    const slug = normalizeSlug(validatedData.slug || validatedData.name);

    if (!slug) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: {
            slug: ["The slug field is required."],
          },
        },
        {
          status: 422,
        },
      );
    }

    const [existingProjectHighlight, existingSlug] = await Promise.all([
      prisma.projectHighlight.findUnique({
        where: {
          name: validatedData.name,
        },
        select: {
          name: true,
        },
      }),
      prisma.projectHighlight.findUnique({
        where: {
          slug,
        },
        select: {
          slug: true,
        },
      }),
    ]);

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

    if (existingSlug) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: {
            slug: ["The slug has already been taken."],
          },
        },
        {
          status: 422,
        },
      );
    }

    const projectHighlight = await prisma.projectHighlight.create({
      data: {
        ...validatedData,
        slug,
      },
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

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = error.meta?.target as string[] | undefined;
      const field = target?.includes("slug") ? "slug" : "name";

      return NextResponse.json(
        {
          message: "Validation failed",
          errors: {
            [field]: [field === "slug" ? "The slug has already been taken." : "Name is already taken"],
          },
        },
        {
          status: 422,
        },
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
