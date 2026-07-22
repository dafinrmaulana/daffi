import { z } from "zod";

export const skillSchema = z.object({
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
    .nullable()
    .optional(),
});

export const updateSkillSchema = skillSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, "At least one field must be provided.");

export type SkillSchema = z.infer<typeof skillSchema>;
export type UpdateSkillSchema = z.infer<typeof updateSkillSchema>;
