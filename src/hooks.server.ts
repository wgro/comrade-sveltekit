import { Sidequest } from 'sidequest';
import { building } from '$app/environment';
import { connectDB } from '$lib/server/db/connection';

if (!building) {
	const mongoUri = process.env.MONGODB_URI;
	if (!mongoUri) {
		throw new Error('MONGODB_URI environment variable is required');
	}

	// Connect to MongoDB first
	await connectDB();

	// Start Sidequest with MongoDB backend
	await Sidequest.start({
		backend: {
			driver: '@sidequest/mongo-backend',
			config: mongoUri
		}
	});
	console.log('Sidequest started! Dashboard: http://localhost:8678');
}
