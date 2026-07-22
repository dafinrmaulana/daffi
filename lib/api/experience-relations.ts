import prisma from "@/lib/providers/prisma";
import type { ExperienceRelationInput } from "@/types/experience";

type RelationField = "companySlug" | "projectHighlightSlug" | "skillSlugs";

export type ResolvedExperienceRelations = {
  companyId: number;
  companyName: string;
  projectHighlightId: number | null;
  skillIds: number[];
};

export class ExperienceRelationValidationError extends Error {
  errors: Partial<Record<RelationField, string[]>>;

  constructor(errors: Partial<Record<RelationField, string[]>>) {
    super("Experience relation validation failed");
    this.name = "ExperienceRelationValidationError";
    this.errors = errors;
  }
}

export function isExperienceRelationValidationError(error: unknown): error is ExperienceRelationValidationError {
  return error instanceof ExperienceRelationValidationError;
}

export async function resolveExperienceRelations(
  input: ExperienceRelationInput,
): Promise<ResolvedExperienceRelations> {
  const skillSlugs = [...new Set(input.skillSlugs)];
  const [company, projectHighlight, skills] = await Promise.all([
    prisma.company.findUnique({ where: { slug: input.companySlug }, select: { id: true, name: true } }),
    input.projectHighlightSlug
      ? prisma.projectHighlight.findUnique({
          where: { slug: input.projectHighlightSlug },
          select: { id: true },
        })
      : null,
    skillSlugs.length
      ? prisma.skill.findMany({ where: { slug: { in: skillSlugs } }, select: { id: true, slug: true } })
      : [],
  ]);

  const errors: Partial<Record<RelationField, string[]>> = {};

  if (!company) errors.companySlug = ["The selected company does not exist."];
  if (input.projectHighlightSlug && !projectHighlight) {
    errors.projectHighlightSlug = ["The selected project highlight does not exist."];
  }

  if (skills.length !== skillSlugs.length) {
    const foundSlugs = new Set(skills.map((skill) => skill.slug));
    const missing = skillSlugs.filter((slug) => !foundSlugs.has(slug));
    errors.skillSlugs = [`The following skills do not exist: ${missing.join(", ")}.`];
  }

  if (Object.keys(errors).length > 0 || !company) {
    throw new ExperienceRelationValidationError(errors);
  }

  return {
    companyId: company.id,
    companyName: company.name,
    projectHighlightId: projectHighlight?.id ?? null,
    skillIds: skills.map((skill) => skill.id),
  };
}
