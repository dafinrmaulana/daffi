import { NextResponse } from "next/server";
import { z } from "zod";

import { isPostRelationValidationError, resolvePostRelations } from "@/lib/api/post-relations";
import { postSchema, updatePostSchema } from "@/lib/form/post-schema";
import { richTextToPlainText, sanitizeRichText } from "@/lib/html/rich-text";
import {
  calculatePostReadTime,
  formatPostDateInput,
  postInclude,
  serializePost,
} from "@/lib/post";
import prisma from "@/lib/providers/prisma";
import { normalizeSlug } from "@/lib/slug";
import { Prisma } from "@/prisma/generated/prisma/client";
import type { RouteContext } from "@/types/api";

export async function GET(_request: Request, { params }: RouteContext<{ slug: string }>) {
  try {
    const { slug } = await params;
    if (!slug.trim()) return NextResponse.json({ message: "Invalid Post slug" }, { status: 400 });

    const post = await prisma.post.findUnique({ where: { slug }, include: postInclude });
    if (!post) return NextResponse.json({ message: "Post not found" }, { status: 404 });

    return NextResponse.json({ message: "Post retrieved successfully", data: serializePost(post) });
  } catch (error) {
    console.error("Failed to retrieve Post", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext<{ slug: string }>) {
  try {
    const { slug: currentSlug } = await params;
    if (!currentSlug.trim()) return NextResponse.json({ message: "Invalid Post slug" }, { status: 400 });

    const currentPost = await prisma.post.findUnique({
      where: { slug: currentSlug },
      include: postInclude,
    });
    if (!currentPost) return NextResponse.json({ message: "Post not found" }, { status: 404 });

    const validatedData = updatePostSchema.parse(await request.json());
    const mergedData = postSchema.parse({
      title: validatedData.title ?? currentPost.title,
      slug: validatedData.slug ?? currentPost.slug,
      date: validatedData.date ?? formatPostDateInput(currentPost.date),
      thumbnail: validatedData.thumbnail ?? currentPost.thumbnail,
      excerpt: validatedData.excerpt ?? currentPost.excerpt,
      published: validatedData.published ?? currentPost.published,
      tagSlugs: validatedData.tagSlugs ?? currentPost.tags.map((tag) => tag.slug),
      body: validatedData.body ?? currentPost.body,
    });

    const relations = await resolvePostRelations(mergedData);
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
      const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
      if (existing) {
        return NextResponse.json(
          { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
          { status: 422 },
        );
      }
    }

    const post = await prisma.post.update({
      where: { slug: currentSlug },
      data: {
        title: mergedData.title,
        slug,
        date: new Date(`${mergedData.date}T00:00:00.000Z`),
        readTime:
          validatedData.body !== undefined
            ? calculatePostReadTime(body)
            : (currentPost.readTime ?? calculatePostReadTime(body)),
        thumbnail: mergedData.thumbnail,
        excerpt: mergedData.excerpt,
        published: mergedData.published,
        body,
        tags: { set: relations.tagIds.map((id) => ({ id })) },
      },
      include: postInclude,
    });

    return NextResponse.json({ message: "Post updated successfully", data: serializePost(post) });
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "Validation failed", errors: { slug: ["The slug has already been taken."] } },
          { status: 422 },
        );
      }
      if (error.code === "P2025") return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    console.error("Failed to update Post", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext<{ slug: string }>) {
  try {
    const { slug } = await params;
    if (!slug.trim()) return NextResponse.json({ message: "Invalid Post slug" }, { status: 400 });

    await prisma.post.delete({ where: { slug } });
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    console.error("Failed to delete Post", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
