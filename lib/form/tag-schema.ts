import { z } from "zod";

import { slugInputSchema } from "@/lib/slug";

export const tagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "The name field is required.")
    .max(255, "The name may not be greater than 255 characters."),

  slug: slugInputSchema,

  description: z
    .string()
    .trim()
    .max(1000, "The description may not be greater than 1000 characters.")
    .transform((value) => (value === "" ? null : value))
    .optional(),
});

export const updateTagSchema = tagSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided.",
});

export type TagSchema = z.infer<typeof tagSchema>;
export type UpdateTagSchema = z.infer<typeof updateTagSchema>;
