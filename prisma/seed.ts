import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminEmail = "admin@gatherwise.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Admin user already exists, updating organization name...");

    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        organizationName: "Gatherwise Demo Church",
        organizationId: "GW-2025-DEMO",
      },
    });

    console.log("Updated admin user with organization details");
    return;
  }

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      name: "System Administrator",
      role: "SUPER_ADMIN",
      isActive: true,
      loginAttempts: 0,
      organizationName: "Gatherwise Demo Church",
      organizationId: "GW-2025-DEMO",
    },
  });

  console.log("Created admin user:", admin.email);
  console.log("Organization:", admin.organizationName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
