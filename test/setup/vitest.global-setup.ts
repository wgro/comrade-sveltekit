import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB_PATH = './storage/comrade.test.db';

export async function setup(): Promise<void> {
	// Remove existing test database to start fresh
	if (existsSync(TEST_DB_PATH)) {
		unlinkSync(TEST_DB_PATH);
	}

	// Push schema to test database
	execSync('bunx prisma db push', {
		env: {
			...process.env,
			DATABASE_URL: `file:${TEST_DB_PATH}`
		},
		stdio: 'inherit'
	});
}

export async function teardown(): Promise<void> {
	// Optionally clean up test database after all tests
	// if (existsSync(TEST_DB_PATH)) {
	// 	unlinkSync(TEST_DB_PATH);
	// }
}
