import z from "zod";

import { slugInputSchema } from "@/lib/slug";

export const projectHighlightSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(255, "Name must not exceed 255 characters."),

  slug: slugInputSchema,

  description: z
    .string()
    .trim()
    .max(1000, "Description must not exceed 1000 characters.")
    .transform((value) => (value === "" ? null : value))
    .optional(),
});

export const updateProjectHighlightSchema = projectHighlightSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export type ProjectHighlightSchema = z.infer<typeof projectHighlightSchema>;
export type UpdateProjectHighlightSchema = z.infer<typeof updateProjectHighlightSchema>;
