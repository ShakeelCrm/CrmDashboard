import { PrismaClient } from './generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg'


export * from './generated/prisma';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  // In production, ensure prisma is available globally for subsequent requires
  globalForPrisma.prisma = prisma;
}

export default prisma