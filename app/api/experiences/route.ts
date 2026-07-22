import { NextResponse } from "next/server";
import { z } from "zod";

import {
  isExperienceRelationValidationError,
  resolveExperienceRelations,
} from "@/lib/api/experience-relations";
import { experienceSchema } from "@/lib/form/experience-schema";
import { richTextToPlainText, sanitizeRichText } from "@/lib/html/rich-text";
import prisma from "@/lib/providers/prisma";
import { normalizeSlug } from "@/lib/slug";
import { Prisma } from "@/prisma/generated/prisma/client";

const experienceInclude = {
  company: true,
  projectHighlight: true,
  skills: { orderBy: { name: "asc" as const } },
};

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));
    const search = searchParams.get("search")?.trim();
    const skip = (page - 1) * limit;

    const where: Prisma.ExperienceWhereInput = search
      ? {
          OR: [
            { role: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
            { company: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {};

    const [experiences, total] = await Promise.all([
      prisma.experience.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
        include: experienceInclude,
      }),
      prisma.experience.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: experiences.map((experience) => ({
        ...experience,
        descriptionText: richTextToPlainText(experience.description),
      })),
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
    console.error("Failed to list experiences", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const validatedData = experienceSchema.parse(await request.json());
    const relations = await resolveExperienceRelations(validatedData);
    const slug = normalizeSlug(validatedData.slug || `${relations.companyName}-${validatedData.role}`);
    const description = sanitizeRichText(validatedData.description);

    if (!slug) {
      return NextResponse.json(
        { message: "Validation failed", errors: { slug: ["The slug field is required."] } },
        { status: 422 },
      );
    }

    if (!richTextToPlainText(description)) {
      return NextResponse.json(
        { message: "Validation failed", errors: { description: ["The description field is required."] } },
        { status: 422 },
      );
    }

    const existingExperience = await prisma.experience.findUnique({ where: { slug }, select: { id: true } });

    if (existingExperience) {
      return NextResponse.json(
        { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
        { status: 422 },
      );
    }

    const experience = await prisma.experience.create({
      data: {
        companyId: relations.companyId,
        role: validatedData.role,
        slug,
        startDate: toDate(validatedData.startDate),
        endDate: validatedData.endDate ? toDate(validatedData.endDate) : null,
        location: validatedData.location,
        description,
        projectHighlightId: relations.projectHighlightId,
        skills: { connect: relations.skillIds.map((id) => ({ id })) },
      },
      include: experienceInclude,
    });

    return NextResponse.json({ message: "Experience created successfully", data: experience }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: z.flattenError(error).fieldErrors },
        { status: 422 },
      );
    }

    if (isExperienceRelationValidationError(error)) {
      return NextResponse.json({ message: "Validation failed", errors: error.errors }, { status: 422 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
        { status: 422 },
      );
    }

    console.error("Failed to create experience", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
