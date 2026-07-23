import type { Company, Project, Tag } from "@/prisma/generated/prisma/client";

export type ProjectMetric = {
  label: string;
  value: string;
};

export type ProjectWithRelations = Omit<Project, "metrics"> & {
  metrics: ProjectMetric[];
  company: Company;
  tags: Tag[];
};

export type ProjectRelationInput = {
  companySlug: string;
  tagSlugs: string[];
};
