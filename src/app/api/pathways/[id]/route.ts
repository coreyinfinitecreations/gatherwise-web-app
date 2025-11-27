import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pathway = await prisma.pathway.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            progress: true,
          },
        },
      },
    });

    if (!pathway) {
      return NextResponse.json({ error: "Pathway not found" }, { status: 404 });
    }

    return NextResponse.json({ pathway }, { status: 200 });
  } catch (error: any) {
    console.error("Get pathway error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch pathway" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, isActive, steps } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (steps !== undefined) {
      await prisma.pathwayStep.deleteMany({
        where: { pathwayId: id },
      });

      updateData.steps = {
        create: steps.map((step: any, index: number) => ({
          name: step.name,
          description: step.description || null,
          order: index + 1,
          isRequired: step.isRequired ?? true,
        })),
      };
    }

    const pathway = await prisma.pathway.update({
      where: { id },
      data: updateData,
      include: {
        steps: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json({ pathway }, { status: 200 });
  } catch (error: any) {
    console.error("Update pathway error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update pathway" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.pathway.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Pathway deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete pathway error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete pathway" },
      { status: 500 }
    );
  }
}
