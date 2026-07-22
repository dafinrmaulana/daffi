import { z } from "zod";

import { slugInputSchema } from "@/lib/slug";

const experienceFieldsSchema = z.object({
  companySlug: z.string().trim().min(1, "The company field is required."),
  role: z
    .string()
    .trim()
    .min(1, "The role field is required.")
    .max(255, "The role may not be greater than 255 characters."),
  slug: slugInputSchema,
  startDate: z.iso.date("The start date must be a valid date."),
  endDate: z.union([z.iso.date("The end date must be a valid date."), z.literal("")]).transform((value) => value || null),
  location: z
    .string()
    .trim()
    .min(1, "The location field is required.")
    .max(255, "The location may not be greater than 255 characters."),
  projectHighlightSlug: z
    .string()
    .trim()
    .transform((value) => value || null)
    .nullable()
    .optional(),
  skillSlugs: z.array(z.string().trim().min(1)).transform((values) => [...new Set(values)]),
  description: z
    .string()
    .trim()
    .min(1, "The description field is required.")
    .max(100_000, "The description may not be greater than 100000 characters."),
});

export const experienceSchema = experienceFieldsSchema.refine(
  (data) => !data.endDate || data.endDate >= data.startDate,
  {
    path: ["endDate"],
    message: "The end date must be on or after the start date.",
  },
);

export const updateExperienceSchema = experienceFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "The end date must be on or after the start date.",
  });

export type ExperienceSchema = z.input<typeof experienceSchema>;
export type ParsedExperienceSchema = z.output<typeof experienceSchema>;
export type UpdateExperienceSchema = z.input<typeof updateExperienceSchema>;
