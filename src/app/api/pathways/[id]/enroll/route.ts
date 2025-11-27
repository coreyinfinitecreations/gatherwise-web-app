import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pathwayId } = await params;
    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs are required" },
        { status: 400 }
      );
    }

    const pathway = await prisma.pathway.findUnique({
      where: { id: pathwayId },
    });

    if (!pathway) {
      return NextResponse.json({ error: "Pathway not found" }, { status: 404 });
    }

    const enrollments = await Promise.all(
      userIds.map(async (userId: string) => {
        try {
          return await prisma.pathwayProgress.create({
            data: {
              userId,
              pathwayId,
              currentStep: 1,
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          });
        } catch (error: any) {
          if (error.code === "P2002") {
            return null;
          }
          throw error;
        }
      })
    );

    const successfulEnrollments = enrollments.filter((e) => e !== null);

    return NextResponse.json(
      {
        message: `Successfully enrolled ${successfulEnrollments.length} member(s)`,
        enrollments: successfulEnrollments,
        skipped: userIds.length - successfulEnrollments.length,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Enroll pathway error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enroll members" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pathwayId } = await params;

    const enrollments = await prisma.pathwayProgress.findMany({
      where: { pathwayId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        completions: {
          include: {
            step: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return NextResponse.json({ enrollments }, { status: 200 });
  } catch (error: any) {
    console.error("Get enrollments error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}
