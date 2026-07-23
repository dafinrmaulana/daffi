import prisma from "@/lib/providers/prisma";
import type { ProjectRelationInput } from "@/types/project";

type RelationField = "companySlug" | "tagSlugs";

export type ResolvedProjectRelations = {
  companyId: number;
  companyName: string;
  tagIds: number[];
};

export class ProjectRelationValidationError extends Error {
  errors: Partial<Record<RelationField, string[]>>;

  constructor(errors: Partial<Record<RelationField, string[]>>) {
    super("Project relation validation failed");
    this.name = "ProjectRelationValidationError";
    this.errors = errors;
  }
}

export function isProjectRelationValidationError(error: unknown): error is ProjectRelationValidationError {
  return error instanceof ProjectRelationValidationError;
}

export async function resolveProjectRelations(input: ProjectRelationInput): Promise<ResolvedProjectRelations> {
  const tagSlugs = [...new Set(input.tagSlugs)];
  const [company, tags] = await Promise.all([
    prisma.company.findUnique({ where: { slug: input.companySlug }, select: { id: true, name: true } }),
    tagSlugs.length
      ? prisma.tag.findMany({ where: { slug: { in: tagSlugs } }, select: { id: true, slug: true } })
      : [],
  ]);

  const errors: Partial<Record<RelationField, string[]>> = {};
  if (!company) errors.companySlug = ["The selected company does not exist."];

  if (tags.length !== tagSlugs.length) {
    const found = new Set(tags.map((tag) => tag.slug));
    const missing = tagSlugs.filter((slug) => !found.has(slug));
    errors.tagSlugs = [`The following tags do not exist: ${missing.join(", ")}.`];
  }

  if (Object.keys(errors).length > 0 || !company) throw new ProjectRelationValidationError(errors);

  return {
    companyId: company.id,
    companyName: company.name,
    tagIds: tags.map((tag) => tag.id),
  };
}
