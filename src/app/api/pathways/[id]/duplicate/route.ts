import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const original = await prisma.pathway.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!original) {
      return NextResponse.json({ error: "Pathway not found" }, { status: 404 });
    }

    const duplicate = await prisma.pathway.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        churchId: original.churchId,
        campusId: original.campusId,
        isActive: false,
        steps: {
          create: original.steps.map((step) => ({
            name: step.name,
            description: step.description,
            order: step.order,
            isRequired: step.isRequired,
          })),
        },
      },
      include: {
        steps: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json({ pathway: duplicate }, { status: 201 });
  } catch (error: any) {
    console.error("Duplicate pathway error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to duplicate pathway" },
      { status: 500 }
    );
  }
}
