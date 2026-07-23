import { richTextToPlainText } from "@/lib/html/rich-text";
import type { Prisma } from "@/prisma/generated/prisma/client";
import type { PostWithRelations } from "@/types/post";

export const postInclude = {
  tags: { orderBy: { name: "asc" as const } },
} satisfies Prisma.PostInclude;

export type PostWithPrismaRelations = Prisma.PostGetPayload<{ include: typeof postInclude }>;

export function calculatePostReadTime(html: string) {
  const wordCount = richTextToPlainText(html).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function serializePost(post: PostWithPrismaRelations): PostWithRelations {
  return {
    ...post,
    date: post.date.toISOString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function formatPostDateInput(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function formatPostDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
