import type { Post, Tag } from "@/prisma/generated/prisma/client";

export type PostWithRelations = Omit<Post, "date" | "createdAt" | "updatedAt"> & {
  date: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
};

export type PostRelationInput = {
  tagSlugs: string[];
};
