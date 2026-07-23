import { z } from "zod";
import { passwordSchema } from "@/lib/auth/password";

export const userFieldsSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  username: z
    .string()
    .trim()
    .min(3, "Username can't be less than 3 characters")
    .transform((username) => username.toLowerCase()),
  email: z.email().min(1, "Email is required"),
});

export const createUserSchema = userFieldsSchema
  .extend({
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine(
    (data) => data.password === data.passwordConfirmation,
    {
      path: ["passwordConfirmation"],
      message: "Password confirmation does not match.",
    },
  );

export const updateUserSchema = userFieldsSchema
  .extend({
    password: z
      .union([passwordSchema, z.literal("")])
      .optional(),
    passwordConfirmation: z.string().optional(),
  })
  .superRefine((data, context) => {
    const changing = Boolean(
      data.password || data.passwordConfirmation,
    );

    if (
      changing &&
      data.password !== data.passwordConfirmation
    ) {
      context.addIssue({
        code: "custom",
        path: ["passwordConfirmation"],
        message: "Password confirmation does not match.",
      });
    }
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
