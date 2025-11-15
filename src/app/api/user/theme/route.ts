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
    const { theme } = body;

    if (!theme || (theme !== "light" && theme !== "dark")) {
      return NextResponse.json(
        { error: "Invalid theme value" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { themePreference: theme },
    });

    return NextResponse.json(
      { message: "Theme preference updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update theme preference error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update theme preference" },
      { status: 500 }
    );
  }
}
