import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ churches: [] }, { status: 200 });
    }

    const church = await prisma.church.findUnique({
      where: { id: user.organizationId },
    });

    if (!church) {
      return NextResponse.json({ churches: [] }, { status: 200 });
    }

    return NextResponse.json({ churches: [church] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching churches:", error);
    return NextResponse.json(
      { error: "Failed to fetch churches" },
      { status: 500 }
    );
  }
}
