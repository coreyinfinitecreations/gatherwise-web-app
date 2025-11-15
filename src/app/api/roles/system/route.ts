import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    let churchId = request.headers.get("x-church-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        churches: {
          include: {
            church: true,
          },
        },
      },
    });

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only Super Admins can modify system roles" },
        { status: 403 }
      );
    }

    // Try to find church in this order:
    // 1. From header
    // 2. From user.organizationId
    // 3. From user's church memberships
    // 4. First church in database

    if (!churchId && user.organizationId) {
      const orgChurch = await prisma.church.findUnique({
        where: { id: user.organizationId },
      });
      if (orgChurch) {
        churchId = orgChurch.id;
        console.log("Using church from user.organizationId:", churchId);
      }
    }

    if (!churchId && user.churches.length > 0) {
      churchId = user.churches[0].church.id;
      console.log("Using church from user membership:", churchId);
    }

    if (!churchId) {
      const firstChurch = await prisma.church.findFirst();
      if (firstChurch) {
        churchId = firstChurch.id;
        console.log("Using first church from database:", churchId);
      }
    }

    if (!churchId) {
      return NextResponse.json(
        {
          error: "No church found in the system. Please create a church first.",
        },
        { status: 400 }
      );
    }

    console.log("Final churchId being used:", churchId);

    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    console.log("Church lookup result:", church);

    if (!church) {
      return NextResponse.json(
        {
          error:
            "Church not found. Please ensure you have a valid church associated with your account.",
        },
        { status: 400 }
      );
    }

    const { name, description, permissions, isSystemRole } =
      await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 }
      );
    }

    const existingRole = await prisma.customRole.findUnique({
      where: {
        name_churchId: {
          name,
          churchId,
        },
      },
      include: {
        permissions: true,
      },
    });

    let role;

    if (existingRole) {
      await prisma.rolePermission.deleteMany({
        where: { roleId: existingRole.id },
      });

      role = await prisma.customRole.update({
        where: { id: existingRole.id },
        data: {
          description,
          isSystemRole: true,
          permissions: {
            create: permissions.map((perm: any) => ({
              resource: perm.resource,
              canRead: perm.canRead,
              canCreate: perm.canCreate,
              canUpdate: perm.canUpdate,
              canDelete: perm.canDelete,
            })),
          },
        },
        include: {
          permissions: true,
        },
      });
    } else {
      role = await prisma.customRole.create({
        data: {
          name,
          description,
          churchId,
          isSystemRole: true,
          permissions: {
            create: permissions.map((perm: any) => ({
              resource: perm.resource,
              canRead: perm.canRead,
              canCreate: perm.canCreate,
              canUpdate: perm.canUpdate,
              canDelete: perm.canDelete,
            })),
          },
        },
        include: {
          permissions: true,
        },
      });
    }

    return NextResponse.json({ role }, { status: 200 });
  } catch (error: any) {
    console.error("System role update API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update system role" },
      { status: 500 }
    );
  }
}
