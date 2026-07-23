import { NextResponse } from "next/server";
import { z } from "zod";

import { isAuthErrorResponse, requireApiUser } from "@/lib/auth/authorize";
import { hashPassword } from "@/lib/auth/password";
import { userPublicSelect } from "@/lib/auth/user-dto";
import { updateUserSchema } from "@/lib/form/user-schema";
import prisma from "@/lib/providers/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import type { RouteContext } from "@/types/api";

export async function PATCH(request: Request, { params }: RouteContext<{ username: string }>) {
  const authorization = await requireApiUser(request);
  if (isAuthErrorResponse(authorization)) return authorization;

  try {
    const { username } = await params;

    if (!username.trim()) {
      return NextResponse.json({ message: "Invalid username" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const orConditions: Array<{ username?: string; email?: string }> = [];

    if (validatedData.username) {
      orConditions.push({ username: validatedData.username });
    }

    if (validatedData.email) {
      orConditions.push({ email: validatedData.email });
    }

    if (orConditions.length > 0) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [{ username: { not: username } }, { OR: orConditions }],
        },
        select: { username: true, email: true },
      });

      if (existingUser) {
        const errors: Record<string, string[]> = {};

        if (validatedData.username && existingUser.username === validatedData.username) {
          errors.username = ["Username is already taken"];
        }

        if (validatedData.email && existingUser.email === validatedData.email) {
          errors.email = ["Email is already registered"];
        }

        return NextResponse.json(
          {
            message: "Validation failed",
            errors,
          },
          { status: 422 },
        );
      }
    }

    const password = validatedData.password
      ? await hashPassword(validatedData.password)
      : undefined;
    const data = {
      name: validatedData.name,
      username: validatedData.username,
      email: validatedData.email,
      ...(password ? { password } : {}),
    };
    const sessionRevoked =
      Boolean(password) && authorization.id === targetUser.id;
    const user = password
      ? (
          await prisma.$transaction([
            prisma.user.update({
              where: { username },
              data,
              select: userPublicSelect,
            }),
            prisma.session.deleteMany({
              where: { userId: targetUser.id },
            }),
          ])
        )[0]
      : await prisma.user.update({
          where: { username },
          data,
          select: userPublicSelect,
        });

    return NextResponse.json({
      message: "User updated successfully",
      data: user,
      ...(sessionRevoked ? { sessionRevoked: true } : {}),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: z.flattenError(error).fieldErrors,
        },
        { status: 422 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target as string[] | undefined;
        const field = target?.includes("email") ? "email" : "username";

        return NextResponse.json(
          {
            message: "Validation failed",
            errors: {
              [field]: [field === "email" ? "Email is already registered" : "Username is already taken"],
            },
          },
          { status: 422 },
        );
      }

      if (error.code === "P2025") {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext<{ username: string }>) {
  const authorization = await requireApiUser(request);
  if (isAuthErrorResponse(authorization)) return authorization;

  try {
    const { username } = await params;

    if (!username.trim()) {
      return NextResponse.json({ message: "Invalid username" }, { status: 400 });
    }

    if (authorization.username === username) {
      return NextResponse.json(
        {
          message:
            "You cannot delete the account currently in use.",
        },
        { status: 422 },
      );
    }

    const deleted = await prisma.$transaction(
      async (transaction) => {
        await transaction.$queryRaw`
          SELECT pg_advisory_xact_lock(
            hashtext('user-deletion-guard')
          )
        `;

        if ((await transaction.user.count()) <= 1) {
          return false;
        }

        await transaction.user.delete({
          where: { username },
        });

        return true;
      },
    );

    if (!deleted) {
      return NextResponse.json(
        { message: "The final User cannot be deleted." },
        { status: 422 },
      );
    }

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
