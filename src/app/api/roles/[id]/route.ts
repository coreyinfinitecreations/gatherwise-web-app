import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Super Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, permissions } = body;

    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    const role = await prisma.customRole.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        permissions: {
          create: permissions || [],
        },
      },
      include: {
        permissions: true,
      },
    });

    return NextResponse.json(
      { message: "Role updated successfully", role },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update role API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update role" },
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Super Admin access required." },
        { status: 403 }
      );
    }

    await prisma.customRole.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Role deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete role API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete role" },
      { status: 500 }
    );
  }
}
