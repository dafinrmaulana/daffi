import { NextResponse } from "next/server";
import { z } from "zod";

import { userSchema } from "@/lib/form/user-schema";
import prisma from "@/lib/providers/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import type { RouteContext } from "@/types/api";

export const updateUserSchema = userSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided.",
});

export async function PATCH(request: Request, { params }: RouteContext<{ username: string }>) {
  try {
    const { username } = await params;

    if (!username.trim()) {
      return NextResponse.json({ message: "Invalid username" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const currentUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!currentUser) {
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

    const user = await prisma.user.update({
      where: { username },
      data: validatedData,
    });

    return NextResponse.json({
      message: "User updated successfully",
      data: user,
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

export async function DELETE(_request: Request, { params }: RouteContext<{ username: string }>) {
  try {
    const { username } = await params;

    if (!username.trim()) {
      return NextResponse.json({ message: "Invalid username" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { username },
    });

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
