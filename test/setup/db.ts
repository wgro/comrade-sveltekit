import { PrismaClient } from '$lib/server/db/generated/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { beforeEach, afterEach, afterAll } from 'vitest';
import type * as runtime from '@prisma/client/runtime/client';

const TEST_DB_URL = 'file:./storage/comrade.test.db';

// Sentinel error for triggering rollback
class RollbackError extends Error {
	constructor() {
		super('ROLLBACK_SENTINEL');
		this.name = 'RollbackError';
	}
}

// Transaction client type - the client passed to interactive transactions
export type TransactionClient = Omit<PrismaClient, runtime.ITXClientDenyList>;

// Test context that will be available in each test
export interface TestDbContext {
	tx: TransactionClient;
}

// Create a dedicated test Prisma client
function createTestClient(): PrismaClient {
	const adapter = new PrismaLibSql({ url: TEST_DB_URL });
	return new PrismaClient({ adapter });
}

// Shared test client instance
let testPrisma: PrismaClient | null = null;

function getTestClient(): PrismaClient {
	if (!testPrisma) {
		testPrisma = createTestClient();
	}
	return testPrisma;
}

/**
 * Sets up a transactional test context.
 * Each test runs within a transaction that is rolled back after the test completes.
 *
 * Usage:
 * ```typescript
 * import { describe, it, expect } from 'vitest';
 * import { setupTestDb } from '../setup/db';
 *
 * describe('Publisher tests', () => {
 *   const { getContext } = setupTestDb();
 *
 *   it('creates a publisher', async () => {
 *     const { tx } = getContext();
 *     const publisher = await tx.publisher.create({ ... });
 *     expect(publisher).toBeDefined();
 *   });
 * });
 * ```
 */
export function setupTestDb(): { getContext: () => TestDbContext } {
	let context: TestDbContext | null = null;
	let transactionPromise: Promise<void> | null = null;
	let rejectTransaction: ((error: Error) => void) | null = null;

	beforeEach(async () => {
		const prisma = getTestClient();

		// Create a promise that will be resolved/rejected to control the transaction
		const controlPromise = new Promise<void>((_resolve, reject) => {
			rejectTransaction = reject;
		});

		// Start the transaction - it will stay open until we throw RollbackError
		transactionPromise = prisma
			.$transaction(
				async (tx) => {
					context = { tx };

					// Wait for the test to complete (or be rejected with RollbackError)
					await controlPromise;
				},
				{
					maxWait: 30000,
					timeout: 60000
				}
			)
			.catch((error) => {
				// Ignore the RollbackError - this is expected
				if (error instanceof RollbackError || error.message === 'ROLLBACK_SENTINEL') {
					return;
				}
				// Re-throw any other errors
				throw error;
			});

		// Wait a tick for the transaction to start and context to be set
		await new Promise((resolve) => setTimeout(resolve, 10));
	});

	afterEach(async () => {
		// Trigger rollback by rejecting the control promise
		if (rejectTransaction) {
			rejectTransaction(new RollbackError());
		}

		// Wait for the transaction to complete (rollback)
		if (transactionPromise) {
			await transactionPromise;
		}

		context = null;
		transactionPromise = null;
		rejectTransaction = null;
	});

	afterAll(async () => {
		if (testPrisma) {
			await testPrisma.$disconnect();
			testPrisma = null;
		}
	});

	return {
		getContext: () => {
			if (!context) {
				throw new Error(
					'Test context not initialized. Make sure setupTestDb() is called in a describe block.'
				);
			}
			return context;
		}
	};
}
