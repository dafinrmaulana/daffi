import { NextResponse } from "next/server";
import { z } from "zod";

import { isAuthErrorResponse, requireApiUser } from "@/lib/auth/authorize";
import { updateCompanySchema } from "@/lib/form/company-schema";
import prisma from "@/lib/providers/prisma";
import { normalizeSlug } from "@/lib/slug";
import { Prisma } from "@/prisma/generated/prisma/client";
import type { RouteContext } from "@/types/api";

export async function PATCH(request: Request, { params }: RouteContext<{ slug: string }>) {
  const authorization = await requireApiUser(request);
  if (isAuthErrorResponse(authorization)) return authorization;

  try {
    const { slug: currentSlug } = await params;

    if (!currentSlug.trim()) {
      return NextResponse.json({ message: "Invalid company slug" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateCompanySchema.parse(body);
    const normalizedSlug = validatedData.slug === undefined ? undefined : normalizeSlug(validatedData.slug);

    if (validatedData.slug !== undefined && !normalizedSlug) {
      return NextResponse.json(
        { message: "Validation failed", errors: { slug: ["The slug field is required."] } },
        { status: 422 },
      );
    }

    const currentCompany = await prisma.company.findUnique({
      where: { slug: currentSlug },
    });

    if (!currentCompany) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    if (normalizedSlug && normalizedSlug !== currentSlug) {
      const existingCompany = await prisma.company.findUnique({
        where: { slug: normalizedSlug },
        select: { id: true },
      });

      if (existingCompany) {
        return NextResponse.json(
          { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
          { status: 422 },
        );
      }
    }

    const company = await prisma.company.update({
      where: { slug: currentSlug },
      data: {
        ...validatedData,
        ...(normalizedSlug ? { slug: normalizedSlug } : {}),
      },
    });

    return NextResponse.json({
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: z.flattenError(error).fieldErrors },
        { status: 422 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
          { status: 422 },
        );
      }

      if (error.code === "P2025") {
        return NextResponse.json({ message: "Company not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext<{ slug: string }>) {
  const authorization = await requireApiUser(request);
  if (isAuthErrorResponse(authorization)) return authorization;

  try {
    const { slug } = await params;

    if (!slug.trim()) {
      return NextResponse.json({ message: "Invalid company slug" }, { status: 400 });
    }

    await prisma.company.delete({
      where: { slug },
    });

    return NextResponse.json({ message: "Company deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ message: "Company not found" }, { status: 404 });
      }

      if (error.code === "P2003") {
        return NextResponse.json(
          { message: "Company cannot be deleted because it is still used by one or more projects or experiences." },
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
