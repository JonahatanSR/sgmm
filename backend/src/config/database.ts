import { PrismaClient } from '@prisma/client';
import { env } from './environment';

// Global PrismaClient instance
let prisma: PrismaClient | undefined;

export const createPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: env.isDevelopment() ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
      errorFormat: 'pretty',
    });
  }
  return prisma;
};

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = createPrismaClient();
  }
  return prisma;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
  }
};

// Initialize on module load
const instance = createPrismaClient();

// Export the instance
export { instance as prisma };






