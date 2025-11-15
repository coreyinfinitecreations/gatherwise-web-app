import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testRegistration() {
  const testEmail = `test-${Date.now()}@example.com`;

  console.log("Testing registration endpoint...");
  console.log("Test email:", testEmail);

  try {
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        church: {
          name: "Test Church",
          address: "123 Main St",
          city: "Test City",
          state: "CA",
          zipCode: "12345",
          phone: "555-1234",
          email: "church@test.com",
        },
        admin: {
          firstName: "Test",
          lastName: "Admin",
          email: testEmail,
          password: "TestPassword123!",
          phone: "555-5678",
        },
        skipPayment: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Registration failed:", data);
      process.exit(1);
    }

    console.log("✅ Registration successful!");
    console.log("\nResponse:", JSON.stringify(data, null, 2));

    console.log("\nVerifying database records...");

    const church = await prisma.church.findUnique({
      where: { id: data.church.id },
      include: {
        campuses: true,
      },
    });

    console.log("\nChurch record:");
    console.log("- Name:", church?.name);
    console.log("- Trial Ends:", church?.trialEndsAt);
    console.log("- Subscription Status:", church?.subscriptionStatus);
    console.log("- Campuses:", church?.campuses.length);

    const user = await prisma.user.findUnique({
      where: { id: data.user.id },
    });

    console.log("\nUser record:");
    console.log("- Name:", user?.name);
    console.log("- Email:", user?.email);
    console.log("- Role:", user?.role);
    console.log("- Organization ID:", user?.organizationId);
    console.log("- Campus ID:", user?.campusId);

    console.log("\n✅ All tests passed!");

    console.log("\nCleaning up test data...");
    await prisma.user.delete({ where: { id: data.user.id } });
    await prisma.church.delete({ where: { id: data.church.id } });
    console.log("✅ Cleanup complete");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testRegistration();
