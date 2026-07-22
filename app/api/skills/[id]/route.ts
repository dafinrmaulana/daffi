import { NextResponse } from "next/server";
import { z } from "zod";

import { updateSkillSchema } from "@/lib/form/skill.schema";
import { Prisma } from "@/prisma/generated/prisma/client";
import prisma from "@/lib/providers/prisma";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const skillId = Number(id);

    if (!Number.isInteger(skillId) || skillId <= 0) {
      return NextResponse.json(
        {
          message: "Invalid skill id",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const validatedData = updateSkillSchema.parse(body);

    const currentSkill = await prisma.skill.findUnique({
      where: {
        id: skillId,
      },
    });

    if (!currentSkill) {
      return NextResponse.json(
        {
          message: "Skill not found",
        },
        {
          status: 404,
        },
      );
    }

    if (validatedData.name && validatedData.name !== currentSkill.name) {
      const existingSkill = await prisma.skill.findFirst({
        where: {
          id: {
            not: skillId,
          },
          name: validatedData.name,
        },
        select: {
          id: true,
        },
      });

      if (existingSkill) {
        return NextResponse.json(
          {
            message: "Validation failed",
            errors: {
              name: ["The name has already been taken."],
            },
          },
          {
            status: 422,
          },
        );
      }
    }

    const skill = await prisma.skill.update({
      where: {
        id: skillId,
      },
      data: validatedData,
    });

    return NextResponse.json({
      message: "Skill updated successfully",
      data: skill,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: z.flattenError(error).fieldErrors,
        },
        {
          status: 422,
        },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            message: "Validation failed",
            errors: {
              name: ["The name has already been taken."],
            },
          },
          {
            status: 422,
          },
        );
      }

      if (error.code === "P2025") {
        return NextResponse.json(
          {
            message: "Skill not found",
          },
          {
            status: 404,
          },
        );
      }
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const skillId = Number(id);

    if (!Number.isInteger(skillId) || skillId <= 0) {
      return NextResponse.json(
        {
          message: "Invalid skill id",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.skill.delete({
      where: {
        id: skillId,
      },
    });

    return NextResponse.json({
      message: "Skill deleted successfully",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          {
            message: "Skill not found",
          },
          {
            status: 404,
          },
        );
      }

      if (error.code === "P2003") {
        return NextResponse.json(
          {
            message: "Skill cannot be deleted because it is still used by one or more experiences.",
          },
          {
            status: 409,
          },
        );
      }
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
