import { NextResponse } from "next/server";
import { z } from "zod";

import { updateCompanySchema } from "@/lib/form/company.schema";
import { Prisma } from "@/prisma/generated/prisma/client";
import prisma from "@/lib/providers/prisma";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

function parseCompanyId(id: string) {
  const companyId = Number(id);

  if (!Number.isInteger(companyId) || companyId <= 0) {
    return null;
  }

  return companyId;
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const companyId = parseCompanyId(id);

    if (companyId === null) {
      return NextResponse.json(
        {
          message: "Invalid company id",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const validatedData = updateCompanySchema.parse(body);

    const currentCompany = await prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
      },
    });

    if (!currentCompany) {
      return NextResponse.json(
        {
          message: "Company not found",
        },
        {
          status: 404,
        },
      );
    }

    const company = await prisma.company.update({
      where: {
        id: companyId,
      },
      data: validatedData,
    });

    return NextResponse.json({
      message: "Company updated successfully",
      data: company,
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

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          message: "Company not found",
        },
        {
          status: 404,
        },
      );
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
    const companyId = parseCompanyId(id);

    if (companyId === null) {
      return NextResponse.json(
        {
          message: "Invalid company id",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.company.delete({
      where: {
        id: companyId,
      },
    });

    return NextResponse.json({
      message: "Company deleted successfully",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          {
            message: "Company not found",
          },
          {
            status: 404,
          },
        );
      }

      if (error.code === "P2003") {
        return NextResponse.json(
          {
            message: "Company cannot be deleted because it is still used by one or more projects or experiences.",
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
