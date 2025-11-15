import { PrismaClient } from "@prisma/client";

const PRODUCTION_DATABASE_URL =
  "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19BOGcxb1Ftb2FrRG9rWkZkS05WVXkiLCJhcGlfa2V5IjoiMDFLOVJESDE2MU5CMFM1QzYwNzUzQ1RUUjYiLCJ0ZW5hbnRfaWQiOiJlY2Y5MjVmOTc3NzJhNWY5M2Q4N2ZkNzgwNDQyZDFiYTQxZGIyZDg2N2NiMjI2NWFmYTg2MDg3N2FkNjk5NTY5IiwiaW50ZXJuYWxfc2VjcmV0IjoiYzJlYjcyZWEtOGM0YS00MGI5LTk1MTItZTBiY2ZjNGM1MThlIn0.y2QxRGswvQ1xVzGIOmnUww7DJ3aM1YrPxPbvLGHkCL4";

const PRODUCTION_DIRECT_URL =
  "postgres://ecf925f97772a5f93d87fd780442d1ba41db2d867cb2265afa860877ad699569:sk_YTshGI84MlFMjtp_QZVZz@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL,
    },
  },
});

async function deleteProductionUser() {
  try {
    console.log("Connecting to PRODUCTION database...");
    console.log(
      "Database tenant ID: ecf925f97772a5f93d87fd780442d1ba41db2d867cb2265afa860877ad699569"
    );

    const user = await prisma.user.findUnique({
      where: { email: "cowens@gatherwise.co" },
      include: {
        churches: true,
      },
    });

    if (!user) {
      console.log("✓ User does not exist in production database");
      return;
    }

    console.log("Found user in PRODUCTION:");
    console.log("  Email:", user.email);
    console.log("  User ID:", user.id);
    console.log("  Organization ID:", user.organizationId);

    const churchId = user.organizationId;

    console.log("\nDeleting user and associated data...");

    await prisma.$transaction(async (tx) => {
      const memberCount = await tx.churchMember.deleteMany({
        where: { userId: user.id },
      });
      console.log(`  ✓ Deleted ${memberCount.count} church member record(s)`);

      await tx.user.delete({
        where: { id: user.id },
      });
      console.log("  ✓ Deleted user account");

      if (churchId) {
        const campusCount = await tx.campus.deleteMany({
          where: { churchId },
        });
        console.log(`  ✓ Deleted ${campusCount.count} campus(es)`);

        await tx.church.delete({
          where: { id: churchId },
        });
        console.log("  ✓ Deleted church organization");
      }
    });

    console.log(
      "\n✅ Successfully deleted cowens@gatherwise.co from PRODUCTION"
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteProductionUser();
