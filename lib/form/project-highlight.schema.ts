import z from "zod";

export const projectHighlightSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(255, "Name must not exceed 255 characters."),

  description: z
    .string()
    .trim()
    .max(1000, "Description must not exceed 1000 characters.")
    .transform((value) => (value === "" ? null : value))
    .optional(),
});

export type ProjectHighlightSchema = z.infer<typeof projectHighlightSchema>;
