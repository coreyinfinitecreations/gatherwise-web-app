import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID provided" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { observesChurchMembership } = body;

    const updatedChurch = await prisma.church.update({
      where: { id },
      data: {
        observesChurchMembership,
      },
    });

    return NextResponse.json({ church: updatedChurch });
  } catch (error) {
    console.error("Error updating church:", error);
    return NextResponse.json(
      { error: "Failed to update church" },
      { status: 500 }
    );
  }
}
