import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkChurches() {
  try {
    console.log("Checking churches in database...\n");

    const churches = await prisma.church.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            members: true,
            campuses: true,
          },
        },
      },
    });

    if (churches.length === 0) {
      console.log("❌ No churches found in database");
    } else {
      console.log(`✓ Found ${churches.length} church(es):\n`);
      churches.forEach((church, index) => {
        console.log(`${index + 1}. ${church.name}`);
        console.log(`   ID: ${church.id}`);
        console.log(`   Members: ${church._count.members}`);
        console.log(`   Campuses: ${church._count.campuses}\n`);
      });
    }

    const users = await prisma.user.findMany({
      select: {
        email: true,
        organizationId: true,
      },
    });

    console.log("Users and their organizationIds:");
    users.forEach((user) => {
      console.log(`  ${user.email}: ${user.organizationId}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChurches();
