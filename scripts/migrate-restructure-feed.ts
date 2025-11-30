#!/usr/bin/env bun
/**
 * Migration script to restructure Feed table
 * 
 * SQLite doesn't support dropping columns directly, so we need to:
 * 1. Create a new Feed table with the correct schema
 * 2. Copy data from old table to new table
 * 3. Drop old table
 * 4. Rename new table
 */

import { Database } from 'bun:sqlite';
import { join } from 'path';

const dbPath = join(process.cwd(), 'storage', 'comrade.db');
const db = new Database(dbPath);

console.log('🔄 Starting migration: Restructure Feed table...\n');

try {
	// Step 1: Check if old columns exist
	console.log('📝 Checking Feed table structure...');
	const feedColumns = db.query(`PRAGMA table_info("Feed")`).all() as Array<{ name: string }>;
	const hasLanguageCode = feedColumns.some(col => col.name === 'languageCode');
	const hasLanguageName = feedColumns.some(col => col.name === 'languageName');
	
	if (!hasLanguageCode && !hasLanguageName) {
		console.log('  ✓ Feed table already has correct structure. No migration needed.\n');
		process.exit(0);
	}

	console.log('  ℹ️  Found old language columns, restructuring...');

	// Step 2: Create new Feed table with correct schema
	console.log('\n📝 Creating new Feed table...');
	db.run(`
		CREATE TABLE IF NOT EXISTS "Feed_new" (
			"id" TEXT NOT NULL PRIMARY KEY,
			"publisherId" TEXT NOT NULL,
			"name" TEXT NOT NULL,
			"url" TEXT NOT NULL,
			"active" INTEGER NOT NULL DEFAULT 1,
			"lastPolledAt" DATETIME,
			"lastError" TEXT,
			"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			"updatedAt" DATETIME NOT NULL,
			CONSTRAINT "Feed_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Publisher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
		);
	`);

	// Step 3: Copy data from old table to new table
	console.log('📋 Copying data...');
	db.run(`
		INSERT INTO "Feed_new" (id, publisherId, name, url, active, lastPolledAt, lastError, createdAt, updatedAt)
		SELECT id, publisherId, name, url, active, lastPolledAt, lastError, createdAt, updatedAt
		FROM "Feed";
	`);

	// Step 4: Drop old table
	console.log('🗑️  Dropping old Feed table...');
	db.run(`DROP TABLE "Feed";`);

	// Step 5: Rename new table
	console.log('✏️  Renaming new table...');
	db.run(`ALTER TABLE "Feed_new" RENAME TO "Feed";`);

	// Step 6: Recreate indexes
	console.log('📇 Creating indexes...');
	db.run(`CREATE UNIQUE INDEX "Feed_publisherId_url_key" ON "Feed"("publisherId", "url");`);

	console.log('\n✅ Feed table restructured successfully!');
	console.log('   Now run: bun run db:push\n');

} catch (error) {
	console.error('❌ Migration failed:', error);
	process.exit(1);
} finally {
	db.close();
}

