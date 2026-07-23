import { NextResponse } from "next/server";
import { z } from "zod";

import { isAuthErrorResponse, requireApiUser } from "@/lib/auth/authorize";
import { companySchema } from "@/lib/form/company-schema";
import prisma from "@/lib/providers/prisma";
import { normalizeSlug } from "@/lib/slug";
import { Prisma } from "@/prisma/generated/prisma/client";

export async function GET(request: Request) {
  const authorization = await requireApiUser(request);
  if (isAuthErrorResponse(authorization)) return authorization;

  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));

    const search = searchParams.get("search")?.trim();

    const skip = (page - 1) * limit;

    const where: Prisma.CompanyWhereInput = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.company.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: companies,
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
  const authorization = await requireApiUser(request);
  if (isAuthErrorResponse(authorization)) return authorization;

  try {
    const body = await request.json();

    const validatedData = companySchema.parse(body);
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

    const existingCompany = await prisma.company.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existingCompany) {
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

    const company = await prisma.company.create({
      data: {
        ...validatedData,
        slug,
      },
    });

    return NextResponse.json(
      {
        message: "Company created successfully",
        data: company,
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
            slug: ["The slug has already been taken."],
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
