import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateAdmin() {
  console.log("Updating admin user with organization details...");

  const admin = await prisma.user.update({
    where: { email: "admin@gatherwise.com" },
    data: {
      organizationName: "Gatherwise Demo Church",
      organizationId: "GW-2025-DEMO",
    },
  });

  console.log("✅ Updated admin user:");
  console.log("  Email:", admin.email);
  console.log("  Organization:", admin.organizationName);
  console.log("  Organization ID:", admin.organizationId);
}

updateAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
