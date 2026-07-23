import type { Prisma } from "@/prisma/generated/prisma/client";
import type { AuthUser } from "@/types/auth";

export const userPublicSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const authUserSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof userPublicSelect;
}>;

type AuthUserRecord = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;

export function toAuthUser(user: AuthUserRecord): AuthUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
  };
}
