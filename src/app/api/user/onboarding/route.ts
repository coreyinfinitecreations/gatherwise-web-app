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
    const { hasMultipleCampuses, onboardingCompleted } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        hasMultipleCampuses: hasMultipleCampuses ?? undefined,
        onboardingCompleted: onboardingCompleted ?? undefined,
      },
    });

    return NextResponse.json(
      { message: "Onboarding updated successfully", user },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update onboarding API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update onboarding" },
      { status: 500 }
    );
  }
}
