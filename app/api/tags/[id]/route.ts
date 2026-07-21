import { tagSchema } from "@/lib/form/tag.schema";
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
    const tagId = Number(id);

    if (Number.isNaN(tagId)) {
      return NextResponse.json(
        {
          message: "Invalid tag id",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.tag.delete({
      where: {
        id: tagId,
      },
    });

    return NextResponse.json({
      message: "Tag deleted successfully",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          message: "Tag not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}

export const updateTagSchema = tagSchema.partial();

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const tagId = Number(id);

    if (Number.isNaN(tagId)) {
      return Response.json(
        {
          message: "Invalid tag id",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();
    const validatedData = updateTagSchema.parse(body);

    const currentTag = await prisma.tag.findUnique({
      where: {
        id: tagId,
      },
    });

    if (!currentTag) {
      return Response.json(
        {
          message: "Tag not found",
        },
        {
          status: 404,
        },
      );
    }

    // Unique validation (exclude current record)
    if (validatedData.name) {
      const existingTag = await prisma.tag.findFirst({
        where: {
          id: {
            not: tagId,
          },
          name: validatedData.name,
        },
        select: {
          name: true,
        },
      });

      if (existingTag) {
        return Response.json(
          {
            message: "Validation failed",
            errors: {
              name: ["Name is already taken"],
            },
          },
          {
            status: 422,
          },
        );
      }
    }
    // Unique validation end

    const tag = await prisma.tag.update({
      where: {
        id: tagId,
      },
      data: validatedData,
    });

    return NextResponse.json(
      {
        message: "Tag updated successfully",
        data: tag,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          message: "Validation failed",
          errors: z.flattenError(error).fieldErrors,
        },
        {
          status: 422,
        },
      );
    }

    // Fallback for race condition
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = error.meta?.target as string[] | undefined;

      const field = target?.[0] ?? "field";

      return Response.json(
        {
          message: "Validation failed",
          errors: {
            [field]: [`${field} is already taken`],
          },
        },
        {
          status: 422,
        },
      );
    }

    return Response.json(
      {
        message: "Internal server error",
        error: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}
