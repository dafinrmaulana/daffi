import { NextResponse } from "next/server";
import { z } from "zod";

import { isProjectRelationValidationError, resolveProjectRelations } from "@/lib/api/project-relations";
import { projectSchema } from "@/lib/form/project-schema";
import { richTextToPlainText, sanitizeRichText } from "@/lib/html/rich-text";
import { parseProjectMetrics } from "@/lib/project";
import prisma from "@/lib/providers/prisma";
import { normalizeSlug } from "@/lib/slug";
import { Prisma } from "@/prisma/generated/prisma/client";
import type { ProjectWithRelations } from "@/types/project";

const projectInclude = {
  company: true,
  tags: { orderBy: { name: "asc" as const } },
} satisfies Prisma.ProjectInclude;

type ProjectWithPrismaRelations = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

function serializeProject(project: ProjectWithPrismaRelations): ProjectWithRelations {
  return { ...project, metrics: parseProjectMetrics(project.metrics) };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));
    const search = searchParams.get("search")?.trim();
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { role: { contains: search, mode: "insensitive" } },
            { excerpt: { contains: search, mode: "insensitive" } },
            { company: { name: { contains: search, mode: "insensitive" } } },
            { tags: { some: { name: { contains: search, mode: "insensitive" } } } },
          ],
        }
      : {};

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ featured: "desc" }, { year: "desc" }, { createdAt: "desc" }],
        include: projectInclude,
      }),
      prisma.project.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({
      data: projects.map(serializeProject),
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
    console.error("Failed to list projects", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const validatedData = projectSchema.parse(await request.json());
    const relations = await resolveProjectRelations(validatedData);
    const slug = normalizeSlug(validatedData.slug || validatedData.title);
    const body = sanitizeRichText(validatedData.body);

    if (!slug) {
      return NextResponse.json(
        { message: "Validation failed", errors: { slug: ["The slug field is required."] } },
        { status: 422 },
      );
    }

    if (!richTextToPlainText(body)) {
      return NextResponse.json(
        { message: "Validation failed", errors: { body: ["The body field is required."] } },
        { status: 422 },
      );
    }

    const existing = await prisma.project.findUnique({ where: { slug }, select: { id: true } });
    if (existing) {
      return NextResponse.json(
        { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
        { status: 422 },
      );
    }

    const project = await prisma.project.create({
      data: {
        title: validatedData.title,
        slug,
        companyId: relations.companyId,
        role: validatedData.role,
        year: validatedData.year,
        demoUrl: validatedData.demoUrl,
        thumbnail: validatedData.thumbnail,
        metric: validatedData.metric,
        excerpt: validatedData.excerpt,
        featured: validatedData.featured,
        body,
        metrics: validatedData.metrics as unknown as Prisma.InputJsonValue,
        tags: { connect: relations.tagIds.map((id) => ({ id })) },
      },
      include: projectInclude,
    });

    return NextResponse.json(
      { message: "Project created successfully", data: serializeProject(project) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: z.flattenError(error).fieldErrors },
        { status: 422 },
      );
    }
    if (isProjectRelationValidationError(error)) {
      return NextResponse.json({ message: "Validation failed", errors: error.errors }, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
        { status: 422 },
      );
    }
    console.error("Failed to create project", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
