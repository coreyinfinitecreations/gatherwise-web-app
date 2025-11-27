import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const churchId = searchParams.get("churchId");
    const campusId = searchParams.get("campusId");

    const where: any = {};

    if (campusId) {
      where.campusId = campusId;
    } else if (churchId) {
      where.OR = [{ churchId }, { campusId: null }];
    }

    const pathways = await prisma.pathway.findMany({
      where,
      include: {
        steps: {
          orderBy: {
            order: 'asc',
          },
        },
        progress: {
          select: {
            id: true,
            completedAt: true,
          },
        },
        _count: {
          select: {
            progress: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ pathways }, { status: 200 });
  } catch (error: any) {
    console.error("Get pathways error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch pathways" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, churchId, campusId, steps } = body;

    if (!name || !churchId) {
      return NextResponse.json(
        { error: "Name and churchId are required" },
        { status: 400 }
      );
    }

    const pathway = await prisma.pathway.create({
      data: {
        name,
        description: description || null,
        churchId,
        campusId: campusId || null,
        isActive: true,
        steps: {
          create: (steps || []).map((step: any, index: number) => ({
            name: step.name,
            description: step.description || null,
            order: index + 1,
            isRequired: true,
          })),
        },
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json({ pathway }, { status: 201 });
  } catch (error: any) {
    console.error("Create pathway error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create pathway" },
      { status: 500 }
    );
  }
}
