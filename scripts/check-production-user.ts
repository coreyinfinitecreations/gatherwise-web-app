import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_DATABASE_URL
    }
  }
})

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: 'cowens@gatherwise.co'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    })
    
    if (user) {
      console.log('✅ User found in production database:')
      console.log(JSON.stringify(user, null, 2))
    } else {
      console.log('❌ User cowens@gatherwise.co NOT found in production database')
    }
    
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
      }
    })
    
    console.log('\nAll users in production database:')
    allUsers.forEach(u => console.log(`- ${u.email} (${u.name})`))

    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
