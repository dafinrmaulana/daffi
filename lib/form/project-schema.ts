import { z } from "zod";

import { slugInputSchema } from "@/lib/slug";

const currentYear = new Date().getFullYear();

const rawMetricsSchema = z
  .array(z.object({ label: z.string(), value: z.string() }))
  .transform((rows) => rows.filter((row) => row.label.trim() || row.value.trim()))
  .pipe(
    z.array(
      z.object({
        label: z
          .string()
          .trim()
          .min(1, "The metric label is required.")
          .max(100, "The metric label may not be greater than 100 characters."),
        value: z
          .string()
          .trim()
          .min(1, "The metric value is required.")
          .max(255, "The metric value may not be greater than 255 characters."),
      }),
    ),
  )
  .superRefine((rows, context) => {
    const seen = new Set<string>();
    rows.forEach((row, index) => {
      const normalized = row.label.toLowerCase();
      if (seen.has(normalized)) {
        context.addIssue({
          code: "custom",
          path: [index, "label"],
          message: "Metric labels must be unique.",
        });
      }
      seen.add(normalized);
    });
  });

const optionalHttpUrlSchema = z
  .string()
  .trim()
  .max(2048, "The demo URL may not be greater than 2048 characters.")
  .refine((value) => !value || /^https?:\/\/[^\s]+$/i.test(value), "The demo URL must use http or https.")
  .transform((value) => value || null);

const projectFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "The title field is required.")
    .max(255, "The title may not be greater than 255 characters."),
  slug: slugInputSchema,
  companySlug: z.string().trim().min(1, "The company field is required."),
  role: z
    .string()
    .trim()
    .min(1, "The role field is required.")
    .max(255, "The role may not be greater than 255 characters."),
  year: z
    .number("The year must be a number.")
    .int("The year must be an integer.")
    .min(1900, "The year must be 1900 or later.")
    .max(currentYear + 1, `The year may not be greater than ${currentYear + 1}.`),
  demoUrl: optionalHttpUrlSchema,
  thumbnail: z
    .string()
    .trim()
    .min(1, "The thumbnail field is required.")
    .max(2048, "The thumbnail may not be greater than 2048 characters.")
    .refine(
      (value) => value.startsWith("/") || /^https?:\/\/[^\s]+$/i.test(value),
      "The thumbnail must be a site-relative path or an http/https URL.",
    ),
  metric: z
    .string()
    .trim()
    .max(255, "The metric may not be greater than 255 characters.")
    .transform((value) => value || null),
  excerpt: z
    .string()
    .trim()
    .min(1, "The excerpt field is required.")
    .max(500, "The excerpt may not be greater than 500 characters."),
  featured: z.boolean().default(false),
  tagSlugs: z.array(z.string().trim().min(1)).transform((values) => [...new Set(values)]),
  metrics: rawMetricsSchema,
  body: z
    .string()
    .trim()
    .min(1, "The body field is required.")
    .max(250_000, "The body may not be greater than 250000 characters."),
});

export const projectSchema = projectFieldsSchema;

export const updateProjectSchema = projectFieldsSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided.",
});

export type ProjectSchema = z.input<typeof projectSchema>;
export type ParsedProjectSchema = z.output<typeof projectSchema>;
export type UpdateProjectSchema = z.input<typeof updateProjectSchema>;
