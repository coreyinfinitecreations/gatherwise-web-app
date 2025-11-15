import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkOrgId() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "cowens@gatherwise.co" },
    });

    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("User email:", user.email);
    console.log("User organizationId:", user.organizationId);
    console.log("User name:", user.name);

    if (user.organizationId) {
      const church = await prisma.church.findUnique({
        where: { id: user.organizationId },
      });

      if (church) {
        console.log("\nChurch found:");
        console.log("Church ID:", church.id);
        console.log("Church name:", church.name);
      } else {
        console.log("\nNo church found with that organization ID");
      }
    }

    // Also check the old ID
    const oldChurch = await prisma.church.findUnique({
      where: { id: "cmi0tgkc400002mfmzkrfh9hj" },
    });

    if (oldChurch) {
      console.log("\nOld church still exists!");
      console.log("Old Church ID:", oldChurch.id);
      console.log("Old Church name:", oldChurch.name);
    } else {
      console.log("\nOld church ID does not exist (good)");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrgId();
