import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';

export * from './generated/client';

const connectionString = `${process.env.DATABASE_URL}`;

// SAFETY CHECK: Warn if the URL is missing
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is missing in the environment variables.");
  console.error("   Make sure you have a .env file in apps/web or apps/api.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ 
    adapter, 
    // log: ['query'] 
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;