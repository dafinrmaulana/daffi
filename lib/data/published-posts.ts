import "server-only";

import { postInclude, serializePost } from "@/lib/post";
import prisma from "@/lib/providers/prisma";

export async function getPublishedPosts() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: postInclude,
  });
  return posts.map(serializePost);
}

export async function getPublishedPost(slug: string) {
  const post = await prisma.post.findFirst({
    where: { slug, published: true },
    include: postInclude,
  });
  return post ? serializePost(post) : null;
}
