import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

async function deleteProductionUser() {
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
    console.log("User ID:", user.id);
    console.log("Organization ID:", user.organizationId);

    const churchId = user.organizationId;

    await prisma.$transaction(async (tx) => {
      await tx.churchMember.deleteMany({
        where: { userId: user.id },
      });
      console.log("Deleted church members");

      await tx.user.delete({
        where: { id: user.id },
      });
      console.log("Deleted user");

      if (churchId) {
        await tx.campus.deleteMany({
          where: { churchId },
        });
        console.log("Deleted campuses");

        await tx.church.delete({
          where: { id: churchId },
        });
        console.log("Deleted church");
      }
    });

    console.log(
      "✓ Successfully deleted cowens@gatherwise.co account and associated data"
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteProductionUser();
