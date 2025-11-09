import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const campus = await prisma.campus.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            lifeGroups: true,
            events: true,
          },
        },
      },
    });

    if (!campus) {
      return NextResponse.json({ error: "Campus not found" }, { status: 404 });
    }

    return NextResponse.json({ campus }, { status: 200 });
  } catch (error: any) {
    console.error("Get campus API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get campus" },
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
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, address, phone, email, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (isActive !== undefined) updateData.isActive = isActive;

    const campus = await prisma.campus.update({
      where: { id },
      data: updateData,
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
      { message: "Campus updated successfully", campus },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update campus API error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Campus not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update campus" },
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
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    await prisma.campus.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Campus deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete campus API error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Campus not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete campus" },
      { status: 500 }
    );
  }
}
