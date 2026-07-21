import { z } from "zod";

export const tagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "The name field is required.")
    .max(255, "The name may not be greater than 255 characters."),

  description: z
    .string()
    .trim()
    .max(1000, "The description may not be greater than 1000 characters.")
    .transform((value) => (value === "" ? null : value))
    .optional(),
});

export type TagSchema = z.infer<typeof tagSchema>;
