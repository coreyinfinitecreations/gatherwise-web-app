import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

async function fixOrganizationId() {
  try {
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
      await tx.church.update({
        where: { id: oldOrgId! },
        data: { id: newOrgId },
      });

      await tx.user.updateMany({
        where: { organizationId: oldOrgId },
        data: { organizationId: newOrgId },
      });

      await tx.churchMember.updateMany({
        where: { churchId: oldOrgId! },
        data: { churchId: newOrgId },
      });

      await tx.campus.updateMany({
        where: { churchId: oldOrgId! },
        data: { churchId: newOrgId },
      });
    });

    console.log("✓ Successfully updated organization ID");
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

fixOrganizationId();
