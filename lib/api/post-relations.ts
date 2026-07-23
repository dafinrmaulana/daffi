import prisma from "@/lib/providers/prisma";
import type { PostRelationInput } from "@/types/post";

type RelationField = "tagSlugs";

export class PostRelationValidationError extends Error {
  errors: Partial<Record<RelationField, string[]>>;

  constructor(errors: Partial<Record<RelationField, string[]>>) {
    super("Post relation validation failed");
    this.name = "PostRelationValidationError";
    this.errors = errors;
  }
}

export function isPostRelationValidationError(error: unknown): error is PostRelationValidationError {
  return error instanceof PostRelationValidationError;
}

export async function resolvePostRelations(input: PostRelationInput) {
  const tagSlugs = [...new Set(input.tagSlugs)];
  const tags = tagSlugs.length
    ? await prisma.tag.findMany({
        where: { slug: { in: tagSlugs } },
        select: { id: true, slug: true },
      })
    : [];

  if (tags.length !== tagSlugs.length) {
    const found = new Set(tags.map((tag) => tag.slug));
    const missing = tagSlugs.filter((slug) => !found.has(slug));
    throw new PostRelationValidationError({
      tagSlugs: [`The following tags do not exist: ${missing.join(", ")}.`],
    });
  }

  return { tagIds: tags.map((tag) => tag.id) };
}
