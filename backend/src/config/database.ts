import { PrismaClient } from '@prisma/client'

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Connect to database
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect()
    console.log('PostgreSQL connected successfully')
  } catch (error) {
    console.error('PostgreSQL connection failed:', error)
    process.exit(1)
  }
}

// Disconnect from database
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('PostgreSQL disconnected')
  } catch (error) {
    console.error('Error disconnecting from PostgreSQL:', error)
  }
}

export default prisma
