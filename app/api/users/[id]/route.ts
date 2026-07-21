import { userSchema } from "@/lib/form/user.schema";
import prisma from "@/lib/providers/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { NextResponse } from "next/server";
import z from "zod";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (Number.isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ message: "Gagal menghapus user" }, { status: 500 });
  }
}

export const updateUserSchema = userSchema.partial();

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const currentUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!currentUser) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // unique validation (exclude diri sendiri)
    const orConditions = [];
    if (validatedData.username) {
      orConditions.push({ username: validatedData.username });
    }

    if (validatedData.email) {
      orConditions.push({ email: validatedData.email });
    }

    if (orConditions.length > 0) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [{ id: { not: Number(id) } }, { OR: orConditions }],
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

        return Response.json(
          {
            message: "Validation failed",
            errors,
          },
          { status: 422 },
        );
      }
    }
    // unique validation end

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: validatedData,
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          message: "Validation failed",
          errors: z.flattenError(error).fieldErrors,
        },
        { status: 422 },
      );
    }

    // Fallback race condition
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = error.meta?.target as string[] | undefined;
      const field = target?.[0] ?? "field";

      return Response.json(
        {
          message: "Validation failed",
          errors: { [field]: [`${field} is already taken`] },
        },
        { status: 422 },
      );
    }

    return Response.json(
      {
        message: "Internal server error",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
