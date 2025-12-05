import { PrismaClient } from './generated/client.ts';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const DATABASE_URL = process.env.DATABASE_URL ?? 'file:./storage/comrade.db';

const adapter = new PrismaLibSql({
	url: DATABASE_URL
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

export async function connectDB(): Promise<void> {
	await prisma.$connect();
	console.log('SQLite database connected');
}

export async function disconnectDB(): Promise<void> {
	await prisma.$disconnect();
	console.log('SQLite database disconnected');
}
