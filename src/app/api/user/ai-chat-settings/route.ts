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
      select: { aiChatVisible: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ aiChatVisible: user.aiChatVisible });
  } catch (error: any) {
    console.error("Get AI chat settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get AI chat settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const { aiChatVisible } = await request.json();

    if (typeof aiChatVisible !== "boolean") {
      return NextResponse.json(
        { error: "aiChatVisible must be a boolean" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { aiChatVisible },
    });

    return NextResponse.json({ success: true, aiChatVisible });
  } catch (error: any) {
    console.error("Update AI chat settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update AI chat settings" },
      { status: 500 }
    );
  }
}
