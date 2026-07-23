import { z } from "zod";

import { slugInputSchema } from "@/lib/slug";

const postFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "The title field is required.")
    .max(255, "The title may not be greater than 255 characters."),
  slug: slugInputSchema,
  date: z.iso.date("The date field must be a valid date."),
  thumbnail: z
    .string()
    .trim()
    .min(1, "The thumbnail field is required.")
    .max(2048, "The thumbnail may not be greater than 2048 characters.")
    .refine(
      (value) => value.startsWith("/") || /^https?:\/\/[^\s]+$/i.test(value),
      "The thumbnail must be a site-relative path or an http/https URL.",
    ),
  excerpt: z
    .string()
    .trim()
    .min(1, "The excerpt field is required.")
    .max(500, "The excerpt may not be greater than 500 characters."),
  published: z.boolean().default(false),
  tagSlugs: z
    .array(z.string().trim().min(1))
    .transform((values) => [...new Set(values)])
    .default([]),
  body: z
    .string()
    .trim()
    .min(1, "The body field is required.")
    .max(250_000, "The body may not be greater than 250000 characters."),
});

export const postSchema = postFieldsSchema;

export const updatePostSchema = postFieldsSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided.",
});

export type PostSchema = z.input<typeof postSchema>;
export type ParsedPostSchema = z.output<typeof postSchema>;
export type UpdatePostSchema = z.input<typeof updatePostSchema>;
