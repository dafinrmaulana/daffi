import { projectHighlightSchema } from "@/lib/form/project-highlight.schema";
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
    const projectHighlightId = Number(id);

    if (Number.isNaN(projectHighlightId)) {
      return NextResponse.json(
        {
          message: "Invalid project highlight id",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.projectHighlight.delete({
      where: {
        id: projectHighlightId,
      },
    });

    return NextResponse.json({
      message: "Project highlight deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to delete project highlight",
      },
      {
        status: 500,
      },
    );
  }
}

export const updateProjectHighlightSchema = projectHighlightSchema.partial();

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const projectHighlightId = Number(id);

    if (Number.isNaN(projectHighlightId)) {
      return Response.json(
        {
          message: "Invalid project highlight id",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();
    const validatedData = updateProjectHighlightSchema.parse(body);

    const currentProjectHighlight = await prisma.projectHighlight.findUnique({
      where: {
        id: projectHighlightId,
      },
    });

    if (!currentProjectHighlight) {
      return Response.json(
        {
          message: "Project highlight not found",
        },
        {
          status: 404,
        },
      );
    }

    // Unique validation (exclude current record)
    if (validatedData.name) {
      const existingProjectHighlight = await prisma.projectHighlight.findFirst({
        where: {
          id: {
            not: projectHighlightId,
          },
          name: validatedData.name,
        },
        select: {
          name: true,
        },
      });

      if (existingProjectHighlight) {
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

    const projectHighlight = await prisma.projectHighlight.update({
      where: {
        id: projectHighlightId,
      },
      data: validatedData,
    });

    return NextResponse.json(projectHighlight, {
      status: 200,
    });
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
