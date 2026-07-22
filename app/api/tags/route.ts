import { tagSchema } from "@/lib/form/tag-schema";
import prisma from "@/lib/providers/prisma";
import { NextResponse } from "next/server";
import z from "zod";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));
    const search = searchParams.get("search")?.trim();
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.tag.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        data: tags,
        meta: {
          currentPage: page,
          perPage: limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch tags",
        error: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = tagSchema.parse(body);

    // unique validation
    const existingTag = await prisma.tag.findUnique({
      where: {
        name: validatedData.name,
      },
      select: {
        name: true,
      },
    });

    if (existingTag) {
      return Response.json(
        {
          message: "Validation failed",
          errors: {
            name: ["Name is already taken"],
          },
        },
        {
          status: 422,
        },
      );
    }
    // unique validation end

    const tag = await prisma.tag.create({
      data: validatedData,
    });

    return NextResponse.json(
      {
        message: "Tag created successfully",
        data: tag,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          message: "Validation failed",
          errors: z.flattenError(error).fieldErrors,
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
      {
        status: 500,
      },
    );
  }
}
