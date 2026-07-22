import { NextResponse } from "next/server";
import { z } from "zod";

import { updateSkillSchema } from "@/lib/form/skill-schema";
import prisma from "@/lib/providers/prisma";
import { normalizeSlug } from "@/lib/slug";
import { Prisma } from "@/prisma/generated/prisma/client";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { slug: currentSlug } = await params;

    if (!currentSlug.trim()) {
      return NextResponse.json({ message: "Invalid skill slug" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateSkillSchema.parse(body);
    const normalizedSlug = validatedData.slug === undefined ? undefined : normalizeSlug(validatedData.slug);

    if (validatedData.slug !== undefined && !normalizedSlug) {
      return NextResponse.json(
        { message: "Validation failed", errors: { slug: ["The slug field is required."] } },
        { status: 422 },
      );
    }

    const currentSkill = await prisma.skill.findUnique({
      where: { slug: currentSlug },
    });

    if (!currentSkill) {
      return NextResponse.json({ message: "Skill not found" }, { status: 404 });
    }

    const [existingName, existingSlug] = await Promise.all([
      validatedData.name && validatedData.name !== currentSkill.name
        ? prisma.skill.findFirst({
            where: { slug: { not: currentSlug }, name: validatedData.name },
            select: { id: true },
          })
        : null,
      normalizedSlug && normalizedSlug !== currentSlug
        ? prisma.skill.findUnique({ where: { slug: normalizedSlug }, select: { id: true } })
        : null,
    ]);

    if (existingName) {
      return NextResponse.json(
        { message: "Validation failed", errors: { name: ["The name has already been taken."] } },
        { status: 422 },
      );
    }

    if (existingSlug) {
      return NextResponse.json(
        { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
        { status: 422 },
      );
    }

    const skill = await prisma.skill.update({
      where: { slug: currentSlug },
      data: {
        ...validatedData,
        ...(normalizedSlug ? { slug: normalizedSlug } : {}),
      },
    });

    return NextResponse.json({ message: "Skill updated successfully", data: skill });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: z.flattenError(error).fieldErrors },
        { status: 422 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target as string[] | undefined;
        const field = target?.includes("slug") ? "slug" : "name";

        return NextResponse.json(
          {
            message: "Validation failed",
            errors: {
              [field]: [field === "slug" ? "The slug has already been taken." : "The name has already been taken."],
            },
          },
          { status: 422 },
        );
      }

      if (error.code === "P2025") {
        return NextResponse.json({ message: "Skill not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { slug } = await params;

    if (!slug.trim()) {
      return NextResponse.json({ message: "Invalid skill slug" }, { status: 400 });
    }

    await prisma.skill.delete({ where: { slug } });

    return NextResponse.json({ message: "Skill deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ message: "Skill not found" }, { status: 404 });
      }

      if (error.code === "P2003") {
        return NextResponse.json(
          { message: "Skill cannot be deleted because it is still used by one or more experiences." },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
