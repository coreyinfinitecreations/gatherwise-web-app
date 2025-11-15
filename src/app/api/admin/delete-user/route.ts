import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const adminKey = searchParams.get("key");

    if (adminKey !== process.env.ADMIN_DELETE_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const churchId = user.organizationId;

    await prisma.$transaction(async (tx) => {
      await tx.churchMember.deleteMany({
        where: { userId: user.id },
      });

      await tx.user.delete({
        where: { id: user.id },
      });

      if (churchId) {
        await tx.campus.deleteMany({
          where: { churchId },
        });

        await tx.church.delete({
          where: { id: churchId },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Deleted user ${email} and associated data`,
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
