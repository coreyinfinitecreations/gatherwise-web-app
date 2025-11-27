import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createDemoChurch() {
  try {
    console.log("Creating demo church with ID: GW-2025-DEMO\n");

    const church = await prisma.church.create({
      data: {
        id: "GW-2025-DEMO",
        name: "Gatherwise Demo Church",
        description: "Demo church for testing",
        hasMultipleCampuses: false,
        observesChurchMembership: true,
      },
    });

    console.log("✅ Church created successfully:");
    console.log(`   ID: ${church.id}`);
    console.log(`   Name: ${church.name}\n`);

    const campus = await prisma.campus.create({
      data: {
        name: "Main Campus",
        churchId: church.id,
        isActive: true,
      },
    });

    console.log("✅ Campus created successfully:");
    console.log(`   ID: ${campus.id}`);
    console.log(`   Name: ${campus.name}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoChurch();
