import { NextRequest, NextResponse } from "next/server";
import { UserManager } from "@/lib/auth/user-manager";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await UserManager.getUserById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("Get user API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get user" },
      { status: 500 }
    );
  }
}
