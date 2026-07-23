import { NextResponse } from "next/server";
import { z } from "zod";

import { isAuthErrorResponse, requireApiUser } from "@/lib/auth/authorize";
import { isProjectRelationValidationError, resolveProjectRelations } from "@/lib/api/project-relations";
import { projectSchema, updateProjectSchema } from "@/lib/form/project-schema";
import { richTextToPlainText, sanitizeRichText } from "@/lib/html/rich-text";
import { parseProjectMetrics } from "@/lib/project";
import prisma from "@/lib/providers/prisma";
import { normalizeSlug } from "@/lib/slug";
import { Prisma } from "@/prisma/generated/prisma/client";
import type { RouteContext } from "@/types/api";
import type { ProjectWithRelations } from "@/types/project";

const projectInclude = {
  company: true,
  tags: { orderBy: { name: "asc" as const } },
} satisfies Prisma.ProjectInclude;

type ProjectWithPrismaRelations = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

function serializeProject(project: ProjectWithPrismaRelations): ProjectWithRelations {
  return { ...project, metrics: parseProjectMetrics(project.metrics) };
}

export async function GET(request: Request, { params }: RouteContext<{ slug: string }>) {
  const authorization = await requireApiUser(request);
  if (isAuthErrorResponse(authorization)) return authorization;

  try {
    const { slug } = await params;
    if (!slug.trim()) return NextResponse.json({ message: "Invalid project slug" }, { status: 400 });

    const project = await prisma.project.findUnique({ where: { slug }, include: projectInclude });
    if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 });

    return NextResponse.json({ message: "Project retrieved successfully", data: serializeProject(project) });
  } catch (error) {
    console.error("Failed to retrieve project", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext<{ slug: string }>) {
  const authorization = await requireApiUser(request);
  if (isAuthErrorResponse(authorization)) return authorization;

  try {
    const { slug: currentSlug } = await params;
    if (!currentSlug.trim()) return NextResponse.json({ message: "Invalid project slug" }, { status: 400 });

    const currentProject = await prisma.project.findUnique({
      where: { slug: currentSlug },
      include: projectInclude,
    });
    if (!currentProject) return NextResponse.json({ message: "Project not found" }, { status: 404 });

    const validatedData = updateProjectSchema.parse(await request.json());
    const mergedData = projectSchema.parse({
      title: validatedData.title ?? currentProject.title,
      slug: validatedData.slug ?? currentProject.slug,
      companySlug: validatedData.companySlug ?? currentProject.company.slug,
      role: validatedData.role ?? currentProject.role,
      year: validatedData.year ?? currentProject.year,
      demoUrl:
        validatedData.demoUrl !== undefined ? (validatedData.demoUrl ?? "") : (currentProject.demoUrl ?? ""),
      thumbnail: validatedData.thumbnail ?? currentProject.thumbnail,
      metric: validatedData.metric !== undefined ? (validatedData.metric ?? "") : (currentProject.metric ?? ""),
      excerpt: validatedData.excerpt ?? currentProject.excerpt,
      featured: validatedData.featured ?? currentProject.featured,
      tagSlugs: validatedData.tagSlugs ?? currentProject.tags.map((tag) => tag.slug),
      metrics: validatedData.metrics ?? parseProjectMetrics(currentProject.metrics),
      body: validatedData.body ?? currentProject.body,
    });

    const relations = await resolveProjectRelations(mergedData);
    const slug = normalizeSlug(mergedData.slug || mergedData.title);
    const body = sanitizeRichText(mergedData.body);

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
    if (slug !== currentSlug) {
      const existing = await prisma.project.findUnique({ where: { slug }, select: { id: true } });
      if (existing) {
        return NextResponse.json(
          { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
          { status: 422 },
        );
      }
    }

    const project = await prisma.project.update({
      where: { slug: currentSlug },
      data: {
        title: mergedData.title,
        slug,
        companyId: relations.companyId,
        role: mergedData.role,
        year: mergedData.year,
        demoUrl: mergedData.demoUrl,
        thumbnail: mergedData.thumbnail,
        metric: mergedData.metric,
        excerpt: mergedData.excerpt,
        featured: mergedData.featured,
        body,
        metrics: mergedData.metrics as unknown as Prisma.InputJsonValue,
        tags: { set: relations.tagIds.map((id) => ({ id })) },
      },
      include: projectInclude,
    });

    return NextResponse.json({ message: "Project updated successfully", data: serializeProject(project) });
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
          { status: 422 },
        );
      }
      if (error.code === "P2025") return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }
    console.error("Failed to update project", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext<{ slug: string }>) {
  const authorization = await requireApiUser(request);
  if (isAuthErrorResponse(authorization)) return authorization;

  try {
    const { slug } = await params;
    if (!slug.trim()) return NextResponse.json({ message: "Invalid project slug" }, { status: 400 });

    await prisma.project.delete({ where: { slug } });
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }
    console.error("Failed to delete project", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
