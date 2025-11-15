import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const church = await prisma.church.upsert({
      where: { id: "GW-2025-CQOHMKNYC" },
      update: {},
      create: {
        id: "GW-2025-CQOHMKNYC",
        name: "Gatherwise Church",
        slug: "gatherwise-church",
      },
    });

    console.log("✅ Church created/updated:", church);
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
