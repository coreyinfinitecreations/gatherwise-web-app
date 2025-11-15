import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const deletedChurches = await prisma.church.deleteMany({});
    console.log(`✅ Deleted ${deletedChurches.count} church(es)`);

    console.log('✅ Cleanup complete');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
