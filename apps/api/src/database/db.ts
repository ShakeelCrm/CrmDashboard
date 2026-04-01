import prisma, { Prisma } from '../prisma';

export { prisma };

// NOTE: Do not use top-level await in this module with CJS output.
// Perform queries inside async functions in controllers/services, e.g.:
// const users = await prisma.user.findMany();