import { PrismaClient } from './generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
export * from './generated/prisma';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const globalForPrisma = globalThis;
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
export default prisma;
