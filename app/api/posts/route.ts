import { NextResponse } from "next/server";
import { z } from "zod";

import { isAuthErrorResponse, requireApiUser } from "@/lib/auth/authorize";
import { isPostRelationValidationError, resolvePostRelations } from "@/lib/api/post-relations";
import { postSchema } from "@/lib/form/post-schema";
import { richTextToPlainText, sanitizeRichText } from "@/lib/html/rich-text";
import { calculatePostReadTime, postInclude, serializePost } from "@/lib/post";
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

    const where: Prisma.PostWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { excerpt: { contains: search, mode: "insensitive" } },
            { body: { contains: search, mode: "insensitive" } },
            { tags: { some: { name: { contains: search, mode: "insensitive" } } } },
          ],
        }
      : {};

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        include: postInclude,
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({
      data: posts.map(serializePost),
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
    console.error("Failed to list Posts", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authorization = await requireApiUser(request);
  if (isAuthErrorResponse(authorization)) return authorization;

  try {
    const validatedData = postSchema.parse(await request.json());
    const relations = await resolvePostRelations(validatedData);
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

    const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    if (existing) {
      return NextResponse.json(
        { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
        { status: 422 },
      );
    }

    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        slug,
        date: new Date(`${validatedData.date}T00:00:00.000Z`),
        readTime: calculatePostReadTime(body),
        thumbnail: validatedData.thumbnail,
        excerpt: validatedData.excerpt,
        published: validatedData.published,
        body,
        tags: { connect: relations.tagIds.map((id) => ({ id })) },
      },
      include: postInclude,
    });

    return NextResponse.json(
      { message: "Post created successfully", data: serializePost(post) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: z.flattenError(error).fieldErrors },
        { status: 422 },
      );
    }
    if (isPostRelationValidationError(error)) {
      return NextResponse.json({ message: "Validation failed", errors: error.errors }, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
        { status: 422 },
      );
    }
    console.error("Failed to create Post", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
