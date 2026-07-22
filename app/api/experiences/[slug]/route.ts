import { NextResponse } from "next/server";
import { z } from "zod";

import {
  isExperienceRelationValidationError,
  resolveExperienceRelations,
} from "@/lib/api/experience-relations";
import { experienceSchema, updateExperienceSchema } from "@/lib/form/experience-schema";
import { richTextToPlainText, sanitizeRichText } from "@/lib/html/rich-text";
import prisma from "@/lib/providers/prisma";
import { normalizeSlug } from "@/lib/slug";
import { Prisma } from "@/prisma/generated/prisma/client";
import type { RouteContext } from "@/types/api";

const experienceInclude = {
  company: true,
  projectHighlight: true,
  skills: { orderBy: { name: "asc" as const } },
};

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export async function GET(_request: Request, { params }: RouteContext<{ slug: string }>) {
  try {
    const { slug } = await params;

    if (!slug.trim()) return NextResponse.json({ message: "Invalid experience slug" }, { status: 400 });

    const experience = await prisma.experience.findUnique({ where: { slug }, include: experienceInclude });

    if (!experience) return NextResponse.json({ message: "Experience not found" }, { status: 404 });

    return NextResponse.json({ message: "Experience retrieved successfully", data: experience });
  } catch (error) {
    console.error("Failed to retrieve experience", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext<{ slug: string }>) {
  try {
    const { slug: currentSlug } = await params;

    if (!currentSlug.trim()) return NextResponse.json({ message: "Invalid experience slug" }, { status: 400 });

    const currentExperience = await prisma.experience.findUnique({
      where: { slug: currentSlug },
      include: experienceInclude,
    });

    if (!currentExperience) return NextResponse.json({ message: "Experience not found" }, { status: 404 });

    const validatedData = updateExperienceSchema.parse(await request.json());
    const mergedData = experienceSchema.parse({
      companySlug: validatedData.companySlug ?? currentExperience.company.slug,
      role: validatedData.role ?? currentExperience.role,
      slug: validatedData.slug ?? currentExperience.slug,
      startDate: validatedData.startDate ?? toDateInput(currentExperience.startDate),
      endDate:
        validatedData.endDate !== undefined
          ? (validatedData.endDate ?? "")
          : toDateInput(currentExperience.endDate),
      location: validatedData.location ?? currentExperience.location,
      projectHighlightSlug:
        validatedData.projectHighlightSlug !== undefined
          ? validatedData.projectHighlightSlug
          : (currentExperience.projectHighlight?.slug ?? ""),
      skillSlugs: validatedData.skillSlugs ?? currentExperience.skills.map((skill) => skill.slug),
      description: validatedData.description ?? currentExperience.description,
    });

    const relations = await resolveExperienceRelations(mergedData);
    const slug = normalizeSlug(mergedData.slug || `${relations.companyName}-${mergedData.role}`);
    const description = sanitizeRichText(mergedData.description);

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

    if (slug !== currentSlug) {
      const existingExperience = await prisma.experience.findUnique({ where: { slug }, select: { id: true } });
      if (existingExperience) {
        return NextResponse.json(
          { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
          { status: 422 },
        );
      }
    }

    const experience = await prisma.experience.update({
      where: { slug: currentSlug },
      data: {
        companyId: relations.companyId,
        role: mergedData.role,
        slug,
        startDate: toDate(mergedData.startDate),
        endDate: mergedData.endDate ? toDate(mergedData.endDate) : null,
        location: mergedData.location,
        description,
        projectHighlightId: relations.projectHighlightId,
        skills: { set: relations.skillIds.map((id) => ({ id })) },
      },
      include: experienceInclude,
    });

    return NextResponse.json({ message: "Experience updated successfully", data: experience });
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

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
          { status: 422 },
        );
      }
      if (error.code === "P2025") return NextResponse.json({ message: "Experience not found" }, { status: 404 });
    }

    console.error("Failed to update experience", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext<{ slug: string }>) {
  try {
    const { slug } = await params;
    if (!slug.trim()) return NextResponse.json({ message: "Invalid experience slug" }, { status: 400 });

    await prisma.experience.delete({ where: { slug } });
    return NextResponse.json({ message: "Experience deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Experience not found" }, { status: 404 });
    }

    console.error("Failed to delete experience", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
