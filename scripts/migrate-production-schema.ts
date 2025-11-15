import { PrismaClient } from "@prisma/client";

const PRODUCTION_DIRECT_URL =
  "postgres://ecf925f97772a5f93d87fd780442d1ba41db2d867cb2265afa860877ad699569:sk_YTshGI84MlFMjtp_QZVZz@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DIRECT_URL,
    },
  },
});

async function migrateProductionSchema() {
  try {
    console.log("Connecting to PRODUCTION database with direct URL...");

    console.log("Adding hasMultipleCampuses column to Church table...");

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Church" 
      ADD COLUMN IF NOT EXISTS "hasMultipleCampuses" BOOLEAN NOT NULL DEFAULT false;
    `);

    console.log(
      "✅ Successfully added hasMultipleCampuses column to production database"
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProductionSchema();
