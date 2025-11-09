import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: "User organization not found" },
        { status: 404 }
      );
    }

    const campuses = await prisma.campus.findMany({
      where: {
        church: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            lifeGroups: true,
            events: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ campuses }, { status: 200 });
  } catch (error: any) {
    console.error("Get campuses API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get campuses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, campusId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: "User organization not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, address, phone, email, isActive, churchId } =
      body;

    if (!name || !churchId) {
      return NextResponse.json(
        { error: "Name and church ID are required" },
        { status: 400 }
      );
    }

    const campus = await prisma.campus.create({
      data: {
        name,
        description,
        address,
        phone,
        email,
        isActive: isActive ?? true,
        churchId,
      },
      include: {
        _count: {
          select: {
            lifeGroups: true,
            events: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Campus created successfully", campus },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create campus API error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Campus with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create campus" },
      { status: 500 }
    );
  }
}
