import { NextResponse } from "next/server";
import { z } from "zod";

import { skillSchema } from "@/lib/form/skill-schema";
import { Prisma } from "@/prisma/generated/prisma/client";
import prisma from "@/lib/providers/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));

    const search = searchParams.get("search")?.trim();

    const skip = (page - 1) * limit;

    const where: Prisma.SkillWhereInput = search
      ? {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              description: {
                contains: search,
              },
            },
          ],
        }
      : {};

    const [skills, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.skill.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: skills,
      meta: {
        currentPage: page,
        perPage: limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
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

    const validatedData = skillSchema.parse(body);

    const existingSkill = await prisma.skill.findUnique({
      where: {
        name: validatedData.name,
      },
      select: {
        id: true,
      },
    });

    if (existingSkill) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: {
            name: ["The name has already been taken."],
          },
        },
        {
          status: 422,
        },
      );
    }

    const skill = await prisma.skill.create({
      data: validatedData,
    });

    return NextResponse.json(
      {
        message: "Skill created successfully",
        data: skill,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: z.flattenError(error).fieldErrors,
        },
        {
          status: 422,
        },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: {
            name: ["The name has already been taken."],
          },
        },
        {
          status: 422,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
