import { z } from "zod";

import { slugInputSchema } from "@/lib/slug";

export const companySchema = z.object({
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
    .nullable()
    .optional(),

  companyLogo: z
    .string()
    .trim()
    .max(2048, "The company logo may not be greater than 2048 characters.")
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional(),
});

export const updateCompanySchema = companySchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided.",
});

export type CompanySchema = z.infer<typeof companySchema>;
export type UpdateCompanySchema = z.infer<typeof updateCompanySchema>;
