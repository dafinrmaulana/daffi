import "server-only";

import { createPaginationMeta } from "@/lib/data/public-pagination";
import prisma from "@/lib/providers/prisma";
import type { Prisma } from "@/prisma/generated/prisma/client";
import type { PaginatedResponse } from "@/types/api";
import type {
  PublicListInput,
  PublicPost,
} from "@/types/public-content";

const publicPostSelect = {
  slug: true,
  title: true,
  date: true,
  readTime: true,
  thumbnail: true,
  excerpt: true,
  body: true,
  tags: {
    orderBy: { name: "asc" as const },
    select: { slug: true, name: true },
  },
} satisfies Prisma.PostSelect;

const postOrder = [
  { date: "desc" as const },
  { createdAt: "desc" as const },
];

type SelectedPost = Prisma.PostGetPayload<{
  select: typeof publicPostSelect;
}>;

function serializePublicPost(post: SelectedPost): PublicPost {
  return {
    ...post,
    date: post.date.toISOString(),
  };
}

export async function listPublicPosts({
  page = 1,
  limit = 10,
}: PublicListInput = {}): Promise<PaginatedResponse<PublicPost>> {
  const where = { published: true };
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: postOrder,
      select: publicPostSelect,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts.map(serializePublicPost),
    meta: createPaginationMeta(page, limit, total),
  };
}

export async function getAllPublicPosts() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: postOrder,
    select: publicPostSelect,
  });

  return posts.map(serializePublicPost);
}

export async function getPublicPost(slug: string) {
  const post = await prisma.post.findFirst({
    where: { slug, published: true },
    select: publicPostSelect,
  });

  return post ? serializePublicPost(post) : null;
}
