import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await params;

    const enrollment = await prisma.pathwayProgress.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    await prisma.pathwayProgress.delete({
      where: { id: enrollmentId },
    });

    return NextResponse.json(
      { message: "Member unenrolled successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Unenroll error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to unenroll member" },
      { status: 500 }
    );
  }
}
