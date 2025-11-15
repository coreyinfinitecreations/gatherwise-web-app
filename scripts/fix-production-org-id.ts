import { PrismaClient } from "@prisma/client";

// Use production database URL from environment
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

async function generateUniqueOrganizationId(): Promise<string> {
  const year = new Date().getFullYear();
  let orgId: string;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    orgId = `GW-${year}-${random}`;
    attempts++;

    if (attempts >= maxAttempts) {
      throw new Error("Unable to generate unique organization ID");
    }

    const existing = await prisma.church.findUnique({
      where: { id: orgId },
    });

    if (!existing) break;
  } while (true);

  return orgId;
}

async function fixProductionOrganizationId() {
  try {
    console.log("Connected to database...");

    const user = await prisma.user.findUnique({
      where: { email: "cowens@gatherwise.co" },
      include: {
        churches: true,
      },
    });

    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("Found user:", user.email);
    console.log("Current organizationId:", user.organizationId);

    if (!user.organizationId) {
      console.log("No organization ID found");
      return;
    }

    // Check if it's already in the correct format
    if (user.organizationId.startsWith("GW-")) {
      console.log("Organization ID is already in the correct format!");
      return;
    }

    const church = await prisma.church.findUnique({
      where: { id: user.organizationId },
    });

    if (!church) {
      console.log("Church not found");
      return;
    }

    console.log("Found church:", church.name);

    const newOrgId = await generateUniqueOrganizationId();
    console.log("Generated new organization ID:", newOrgId);

    const oldOrgId = user.organizationId;

    await prisma.$transaction(async (tx) => {
      // Update church ID
      await tx.church.update({
        where: { id: oldOrgId! },
        data: { id: newOrgId },
      });

      // Update all users with this organization
      await tx.user.updateMany({
        where: { organizationId: oldOrgId },
        data: { organizationId: newOrgId },
      });

      // Update church members
      await tx.churchMember.updateMany({
        where: { churchId: oldOrgId! },
        data: { churchId: newOrgId },
      });

      // Update campuses
      await tx.campus.updateMany({
        where: { churchId: oldOrgId! },
        data: { churchId: newOrgId },
      });

      console.log("Updated Church, Users, ChurchMembers, and Campuses");
    });

    console.log("✓ Successfully updated organization ID");
    console.log("Old organization ID:", oldOrgId);
    console.log("New organization ID:", newOrgId);

    const updatedUser = await prisma.user.findUnique({
      where: { email: "cowens@gatherwise.co" },
    });

    console.log("Updated user organizationId:", updatedUser?.organizationId);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionOrganizationId();
