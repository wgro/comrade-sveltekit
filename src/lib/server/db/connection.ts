import { PrismaClient } from './generated/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
	url: 'file:./storage/comrade.db'
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
