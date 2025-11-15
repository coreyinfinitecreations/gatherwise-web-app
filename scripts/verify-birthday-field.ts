import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Testing birthday field access...')
    
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        birthday: true,
      }
    })
    
    console.log('✅ Success! Birthday field is accessible')
    console.log('Sample user:', user)
    
  } catch (error) {
    console.error('❌ Error accessing birthday field:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
