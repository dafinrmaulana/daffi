import { userSchema } from "@/lib/form/user.schema";
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
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { username: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),

      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: users,
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
    const validatedData = userSchema.parse(body);

    // unique validation
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: validatedData.username }, { email: validatedData.email }],
      },
      select: { username: true, email: true },
    });

    if (existingUser) {
      const errors: Record<string, string[]> = {};

      if (existingUser.username === validatedData.username) {
        errors.username = ["Username is already taken"];
      }
      if (existingUser.email === validatedData.email) {
        errors.email = ["Email is already registered"];
      }

      return Response.json(
        {
          message: "Validation failed",
          errors,
        },
        { status: 422 },
      );
    }
    // unique validation end

    const user = await prisma.user.create({ data: validatedData });
    return NextResponse.json(user, { status: 201 });
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
