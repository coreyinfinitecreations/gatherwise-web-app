import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.church.upsert({
    where: { id: "GW-2025-CQOHMKNYC" },
    update: {},
    create: {
      id: "GW-2025-CQOHMKNYC",
      name: "Gatherwise Church",
      description: "Main church organization",
    },
  });
  console.log("✅ Church GW-2025-CQOHMKNYC created/verified");

  const adminEmail = "admin@gatherflow.co";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(
      "Admin user already exists, checking for church and campuses..."
    );

    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        organizationName: "Gatherflow Demo Church",
        organizationId: "GW-2025-DEMO",
      },
    });

    const existingChurch = await prisma.church.findFirst({
      where: {
        members: {
          some: {
            userId: existingAdmin.id,
          },
        },
      },
    });

    if (!existingChurch) {
      const church = await prisma.church.create({
        data: {
          name: "Gatherflow Demo Church",
          description: "A demonstration church for the Gatherflow platform",
          address: "123 Main Street, Demo City, ST 12345",
          phone: "(555) 123-4567",
          email: "info@gatherwisedemo.org",
          website: "https://gatherwisedemo.org",
          members: {
            create: {
              userId: existingAdmin.id,
              role: "ADMIN",
            },
          },
        },
      });

      console.log("Created church:", church.name);

      const campuses = await prisma.campus.createMany({
        data: [
          {
            name: "Main Campus",
            description: "Our original location in downtown",
            address: "123 Main St, Demo City, ST 12345",
            phone: "(555) 123-4567",
            email: "main@gatherwisedemo.org",
            isActive: true,
            churchId: church.id,
          },
          {
            name: "North Campus",
            description: "Serving the north side of the city",
            address: "456 North Ave, Demo City, ST 12345",
            phone: "(555) 234-5678",
            email: "north@gatherwisedemo.org",
            isActive: true,
            churchId: church.id,
          },
          {
            name: "Online Campus",
            description: "Virtual campus for online attendees",
            address: "Online",
            phone: null,
            email: "online@gatherwisedemo.org",
            isActive: true,
            churchId: church.id,
          },
        ],
      });

      console.log("Created campuses:", campuses.count);
    } else {
      console.log("Church and campuses already exist");
    }

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
      organizationName: "Gatherflow Demo Church",
      organizationId: "GW-2025-DEMO",
    },
  });

  console.log("Created admin user:", admin.email);
  console.log("Organization:", admin.organizationName);

  const church = await prisma.church.create({
    data: {
      name: "Gatherflow Demo Church",
      description: "A demonstration church for the Gatherflow platform",
      address: "123 Main Street, Demo City, ST 12345",
      phone: "(555) 123-4567",
      email: "info@gatherwisedemo.org",
      website: "https://gatherwisedemo.org",
      members: {
        create: {
          userId: admin.id,
          role: "ADMIN",
        },
      },
    },
  });

  console.log("Created church:", church.name);

  const campuses = await prisma.campus.createMany({
    data: [
      {
        name: "Main Campus",
        description: "Our original location in downtown",
        address: "123 Main St, Demo City, ST 12345",
        phone: "(555) 123-4567",
        email: "main@gatherwisedemo.org",
        isActive: true,
        churchId: church.id,
      },
      {
        name: "North Campus",
        description: "Serving the north side of the city",
        address: "456 North Ave, Demo City, ST 12345",
        phone: "(555) 234-5678",
        email: "north@gatherwisedemo.org",
        isActive: true,
        churchId: church.id,
      },
      {
        name: "Online Campus",
        description: "Virtual campus for online attendees",
        address: "Online",
        phone: null,
        email: "online@gatherwisedemo.org",
        isActive: true,
        churchId: church.id,
      },
    ],
  });

  console.log("Created campuses:", campuses.count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
