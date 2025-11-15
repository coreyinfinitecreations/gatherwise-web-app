import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: "admin@gatherwise.com" },
    include: {
      churches: {
        include: {
          church: {
            include: {
              campuses: true
            }
          }
        }
      }
    }
  });

  console.log("Admin user:", {
    email: admin?.email,
    hasMultipleCampuses: admin?.hasMultipleCampuses,
    onboardingCompleted: admin?.onboardingCompleted
  });

  if (admin?.churches[0]) {
    console.log("Church:", admin.churches[0].church.name);
    console.log("Campuses:", admin.churches[0].church.campuses.length);
    admin.churches[0].church.campuses.forEach(c => {
      console.log(`  - ${c.name}`);
    });
  }

  // Update user to have multiple campuses
  if (admin && admin.churches[0]?.church.campuses.length > 1) {
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        hasMultipleCampuses: true,
        onboardingCompleted: true
      }
    });
    console.log("\nUpdated admin user: hasMultipleCampuses = true");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
