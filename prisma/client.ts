// prisma/client.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
// This setup ensures that during development, we don't create multiple instances of PrismaClient,
// which can lead to exhausting database connections. In production, a new instance is created as usual.
