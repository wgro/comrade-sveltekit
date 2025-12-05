import { Sidequest } from 'sidequest';
import { building } from '$app/environment';
import { connectDB } from '$lib/server/db/connection';

if (!building) {
	// Connect to SQLite via Prisma
	await connectDB();

	// Start Sidequest with SQLite backend
	await Sidequest.start({
		backend: {
			driver: '@sidequest/sqlite-backend',
			config: './storage/sidequest.db'
		},
		queues: [{ name: 'default', concurrency: 1, priority: 10 }],
		manualJobResolution: true,
		jobsFilePath: '../worker/sidequest.jobs.ts'
	});
	console.log('Sidequest started! Dashboard: http://localhost:8678');
}
