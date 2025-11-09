import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@gatherwise.com";
  const password = "Password123!";

  console.log("Testing authentication for:", email);

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    console.log("❌ User not found");
    return;
  }

  console.log("✅ User found:");
  console.log("  - Email:", user.email);
  console.log("  - Name:", user.name);
  console.log("  - Role:", user.role);
  console.log("  - isActive:", user.isActive);
  console.log("  - passwordHash exists:", !!user.passwordHash);
  console.log("  - passwordHash length:", user.passwordHash?.length);

  if (!user.passwordHash) {
    console.log("❌ No password hash found");
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  console.log("  - Password valid:", isValidPassword);

  if (isValidPassword) {
    console.log("\n✅ Authentication should work!");
  } else {
    console.log("\n❌ Password does not match");

    // Test if we can create a new hash and it works
    const testHash = await bcrypt.hash(password, 12);
    const testMatch = await bcrypt.compare(password, testHash);
    console.log("  - Test hash creation works:", testMatch);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
