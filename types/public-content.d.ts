import type { ProjectMetric } from "@/types/project";

export type PublicCompany = {
  slug: string;
  name: string;
  companyLogo: string | null;
};

export type PublicTag = {
  slug: string;
  name: string;
};

export type PublicProjectHighlight = {
  slug: string;
  name: string;
  description: string | null;
};

export type PublicProject = {
  slug: string;
  title: string;
  company: PublicCompany;
  role: string;
  year: number;
  demoUrl: string | null;
  thumbnail: string;
  metric: string | null;
  excerpt: string;
  featured: boolean;
  tags: PublicTag[];
  body: string;
  metrics: ProjectMetric[];
};

export type PublicSkill = {
  slug: string;
  name: string;
  description: string | null;
};

export type PublicExperience = {
  slug: string;
  company: PublicCompany;
  role: string;
  startDate: string;
  endDate: string | null;
  location: string;
  description: string;
  projectHighlight: PublicProjectHighlight | null;
  skills: PublicSkill[];
};

export type PublicPost = {
  slug: string;
  title: string;
  date: string;
  readTime: number | null;
  thumbnail: string;
  excerpt: string;
  tags: PublicTag[];
  body: string;
};

export type PublicListInput = {
  page?: number;
  limit?: number;
};
