import { NextResponse } from "next/server";
import { z } from "zod";

import { updateTagSchema } from "@/lib/form/tag-schema";
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
      return NextResponse.json({ message: "Invalid tag slug" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateTagSchema.parse(body);
    const normalizedSlug = validatedData.slug === undefined ? undefined : normalizeSlug(validatedData.slug);

    if (validatedData.slug !== undefined && !normalizedSlug) {
      return NextResponse.json(
        { message: "Validation failed", errors: { slug: ["The slug field is required."] } },
        { status: 422 },
      );
    }

    const currentTag = await prisma.tag.findUnique({ where: { slug: currentSlug } });

    if (!currentTag) {
      return NextResponse.json({ message: "Tag not found" }, { status: 404 });
    }

    const [existingName, existingSlug] = await Promise.all([
      validatedData.name && validatedData.name !== currentTag.name
        ? prisma.tag.findFirst({
            where: { slug: { not: currentSlug }, name: validatedData.name },
            select: { id: true },
          })
        : null,
      normalizedSlug && normalizedSlug !== currentSlug
        ? prisma.tag.findUnique({ where: { slug: normalizedSlug }, select: { id: true } })
        : null,
    ]);

    if (existingName) {
      return NextResponse.json(
        { message: "Validation failed", errors: { name: ["Name is already taken"] } },
        { status: 422 },
      );
    }

    if (existingSlug) {
      return NextResponse.json(
        { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
        { status: 422 },
      );
    }

    const tag = await prisma.tag.update({
      where: { slug: currentSlug },
      data: {
        ...validatedData,
        ...(normalizedSlug ? { slug: normalizedSlug } : {}),
      },
    });

    return NextResponse.json({ message: "Tag updated successfully", data: tag });
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
              [field]: [field === "slug" ? "The slug has already been taken." : "Name is already taken"],
            },
          },
          { status: 422 },
        );
      }

      if (error.code === "P2025") {
        return NextResponse.json({ message: "Tag not found" }, { status: 404 });
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
      return NextResponse.json({ message: "Invalid tag slug" }, { status: 400 });
    }

    await prisma.tag.delete({ where: { slug } });

    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
