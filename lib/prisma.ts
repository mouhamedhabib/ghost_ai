import { PrismaClient } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL!

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const pool = new Pool({ connectionString: databaseUrl })
    const adapter = new PrismaPg(pool)
    const client = new PrismaClient({ adapter })
    return client
  })()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma