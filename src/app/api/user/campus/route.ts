import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { campusId } = body;

    if (!campusId) {
      return NextResponse.json(
        { error: "Campus ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { campusId },
      select: {
        id: true,
        name: true,
        email: true,
        campusId: true,
        organizationId: true,
        organizationName: true,
      },
    });

    return NextResponse.json(
      { message: "Campus updated successfully", user },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update user campus API error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update campus" },
      { status: 500 }
    );
  }
}
