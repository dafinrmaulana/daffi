import { z } from "zod";

export const userSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  username: z.string().trim().min(3, "Username can't be less than 3 characters"),
  email: z.email().min(1, "Email is required"),
});

export type UserSchema = z.infer<typeof userSchema>;
