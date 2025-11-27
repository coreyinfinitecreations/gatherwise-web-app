import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pathway = await prisma.pathway.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: {
            order: "asc",
          },
          include: {
            completions: true,
          },
        },
        progress: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!pathway) {
      return NextResponse.json(
        { error: "Pathway not found" },
        { status: 404 }
      );
    }

    const totalEnrolled = pathway.progress.length;
    const completedCount = pathway.progress.filter(
      (p) => p.completedAt !== null
    ).length;
    const inProgress = totalEnrolled - completedCount;
    const completionRate =
      totalEnrolled > 0 ? (completedCount / totalEnrolled) * 100 : 0;

    const stepAnalytics = pathway.steps.map((step) => ({
      id: step.id,
      name: step.name,
      order: step.order,
      completions: step.completions.length,
      dropOffRate:
        totalEnrolled > 0
          ? ((totalEnrolled - step.completions.length) / totalEnrolled) * 100
          : 0,
    }));

    const analytics = {
      totalEnrolled,
      completedCount,
      inProgress,
      completionRate: Math.round(completionRate),
      stepAnalytics,
      recentProgress: pathway.progress
        .slice(0, 10)
        .map((p) => ({
          memberName: p.user.name || "Unknown",
          currentStep: p.currentStep,
          startedAt: p.startedAt,
          completedAt: p.completedAt,
        })),
    };

    return NextResponse.json({ analytics }, { status: 200 });
  } catch (error: any) {
    console.error("Get pathway analytics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
